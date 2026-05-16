import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useLocation } from "react-router";
import type { Activity } from "../types";
import { useAccount } from "./useAccount";

export const useActivities = (id?: string) => {

    const queryClient = useQueryClient();
    const currentUser = useAccount();
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
        enabled: !id && location.pathname === '/activities' && !!currentUser
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
        enabled: !!id && !!currentUser 
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

    return {activities, isLoading, updateActivity, createActivity, deleteActivity, activity, isLoadingActivity}
}