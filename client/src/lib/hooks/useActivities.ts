import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useLocation } from "react-router";
import type { Activity } from "../types";
import { useAccount } from "./useAccount";

export const useActivities = (id?: string) => {

    const queryClient = useQueryClient();
    const {currentUser} = useAccount();
    const location = useLocation();

    // now when we go to the create activity tab there is nothing to be loaded however the loading is taking place
    // so we want the list to be loaded only if it is in this route

    const {data: activities, isLoading} = useQuery({
            queryKey: ['activities'],
            queryFn: async () => {
            const response = await agent.get<Activity[]>('/activities');
            return response.data;
        },
        // staleTime: 1000 * 60 * 5 // for 5 min
        enabled: !id && location.pathname === '/activities' && !!currentUser,
        select: data => { 
            return data.map(activity => {
                return {
                    ...activity, 
                    isHost: currentUser?.id === activity.hostId,
                    isGoing: activity.attendees.some(x => x.id === currentUser?.id)
                }
            })
        }
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
                return {
                    ...data, 
                    isHost: currentUser?.id === data.hostId,
                    isGoing: data.attendees.some(x => x.id === currentUser?.id)
                }
        }
    });

    const updateActivity = useMutation({
        mutationFn: async(activity: Activity) => {
            await agent.put('/activities', activity)
        },
        onSuccess: async ()=>{
            await queryClient.invalidateQueries({ // the invalidate so after update we go and
            // fetch the data from the server with the new updates
                queryKey: ['activities']
            })
        }
    })

    const createActivity = useMutation({
        mutationFn: async(activity: Activity) => {
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
            await queryClient.cancelQueries({queryKey: [activities, activityId]});

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

    return {activities, isLoading, updateActivity, createActivity, deleteActivity, activity, isLoadingActivity, updateAttendance}
}