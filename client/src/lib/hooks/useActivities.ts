import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useLocation } from "react-router";
import type { Activity, PagedList } from "../types";
import { useAccount } from "./useAccount";
import { useStore } from "./useStore";
import type { FieldValues } from "react-hook-form";

export const useActivities = (id?: string) => {
    const {activityStore: {filter, startDate}} = useStore();
    const queryClient = useQueryClient();
    const {currentUser} = useAccount();
    const location = useLocation();

    // now when we go to the create activity tab there is nothing to be loaded however the loading is taking place
    // so we want the list to be loaded only if it is in this route

    // now we need to make when either filter or startDate change to change it basically get the data and to do that we need
    // to observe (since we will use mobx not react query) however we can't do that on the hook but we will add the observer to the component! 
    const {data: activitiesGroup, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } 
    = useInfiniteQuery<PagedList<Activity, string>>({
        // now it uses the same query key for every query and if we want our filters to work we will need to pass them too
        queryKey: ['activities', filter, startDate],
        // we made it = null since in the first time we don't need to send the param
        // the inifinite query will take automatically the care of the changing of the param
        queryFn: async ({pageParam = null}) => {
        const response = await agent.get<PagedList<Activity, string>>('/activities', {
            // these are query string parameters
            params: {
                cursor: pageParam,
                pageSize: 3,
                filter,
                startDate
            }
        });
        return response.data;
        },
        // staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData, // so when loading nothing is removed till the new data come
        initialPageParam: null, // it is required by infinite query
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !id && location.pathname === '/activities' && !!currentUser,
        select: data => ({
            ...data,
            pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map(activity => {
                    const host = activity?.attendees.find(x => x.id === activity.hostId);
                    return {
                        ...activity, 
                        // we are defining them here rather than editing our apis
                        isHost: currentUser?.id === activity.hostId,
                        isGoing: activity.attendees.some(x => x.id === currentUser?.id),
                        hostImageUrl: host?.imageUrl
                    }
                })
            }))
        }) // we included it with () so we can implicitly return what is inside it
    });
    // there is qui
    // te no difference in this stage between isloading and ispending
    // we gave alias name ot isloading so if we want to change it later it is smooth

    // now all the queries inside the one hook will be fetched when one of them is called so that consumes the api 
    // and might cause error for this query, so we gonna add enabled flag
    const {data: activity, isLoading: isLoadingActivity} = useQuery({
            queryKey: ['activities', id],
            queryFn: async () => {
            const response = await agent.get<Activity>(`/activities/${id}`);
            return response.data;
        },
        // the !! cast it into boolean
        enabled: !!id && !!currentUser ,
        select: data => { 
            const host = data?.attendees.find(x => x.id === data.hostId);

            return {
                ...data, 
                isHost: currentUser?.id === data.hostId,
                isGoing: data.attendees.some(x => x.id === currentUser?.id),
                hostImageUrl: host?.imageUrl
            }
        }
    });

    const updateActivity = useMutation({
        mutationFn: async(activity: Activity) => {
            await agent.put(`/activities/${activity.id}`, activity)
        },
        onSuccess: async ()=>{
            await queryClient.invalidateQueries({ // the invalidate so after update we go and
            // fetch the data from the server with the new updates
                queryKey: ['activities', activity?.id]
            })
        }
    })

    const createActivity = useMutation({
        mutationFn: async(activity: FieldValues) => {
            const response = await agent.post('/activities', activity);
            return response.data;
        },
        onSuccess: async ()=>{
            await queryClient.invalidateQueries({ // the invalidate so after update we go and
            // fetch the data from the server with the new updates
                queryKey: ['activities']
            })
        }
    })

    const deleteActivity = useMutation({
        mutationFn: async(id: string) => {
            await agent.delete(`/activities/${id}`)
        },
        onSuccess: async ()=>{
            await queryClient.invalidateQueries({ // the invalidate so after update we go and
            // fetch the data from the server with the new updates as we are precisely saying the data is stale
                queryKey: ['activities']
            })
        }
    })

    const updateAttendance = useMutation({
        mutationFn: async (id: string) => {
            await agent.post(`/activities/${id}/attend`)
        },
        // when we print the log for the mutation fn and the on sucess both should have the same id
        // and as we are using the id of the main class then we need to pass the id when we use the useActivities
        onMutate: async (activityId: string) => {
            // we gonna cancel any query as we don't anything to override our updates by synching to the api at this stage
            await queryClient.cancelQueries({queryKey: ['activities', activityId]});

            // now to get the activity from the cache
            const prevActivity = queryClient.getQueryData<Activity>(['activities', activityId]);

            // this way we are updating only inside our cache
            queryClient.setQueryData<Activity>(['activities', activityId], oldActivity => {
                if(!oldActivity || !currentUser) return oldActivity;

                const isHost = oldActivity.hostId === currentUser.id;
                const isAttending = oldActivity.attendees.some(x => x.id === currentUser.id);

                return {
                    ...oldActivity,
                    isCancelled: isHost ? !oldActivity.isCancelled : oldActivity.isCancelled,
                    attendees: isAttending 
                        ? isHost
                            ? oldActivity.attendees
                            : oldActivity.attendees.filter(x => x.id !== currentUser.id)
                        : [...oldActivity.attendees, {
                            id: currentUser.id,
                            displayName: currentUser.displayName,
                            imageUrl: currentUser.imageUrl
                        }] 

                }
            })

            return {prevActivity}
        },
        onError: (error, activityId, context) => {
            console.log(error)
            if(context?.prevActivity) {
                queryClient.setQueryData(['activities', activityId], context.prevActivity)

            }
        }
    })

    return {activitiesGroup, isLoading, updateActivity, createActivity, deleteActivity, activity, isLoadingActivity, 
        updateAttendance, isFetchingNextPage, fetchNextPage, hasNextPage}
}