import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr"
import { useLocalObservable } from "mobx-react-lite"
import { useEffect, useRef } from "react";
import type { ChatComment } from "../types";
import { runInAction } from "mobx";

export const useComments = (activityId?: string) => {
    // use ref won't be recreated or modified during any rerender of this hook or any of observalbe actions
    const created = useRef(false);
    // when we write ({}) with () => ({}) this mean we are going to return without needing to explicitly state that
    const commentStore = useLocalObservable(() =>({
        comments: [] as ChatComment[],
        hubConnection: null as HubConnection | null,

        createHubConnection(activityId: string) {
            if(!activityId) return;

            this.hubConnection = new HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_COMMENTS_URL}?activityId=${activityId}`, {
                    withCredentials: true
                })
                .withAutomaticReconnect()
                .build();

            this.hubConnection?.start().catch(error => console.log('Error establishing connection: ', error))

            // this is how to listen to the LoadComments
            this.hubConnection.on('LoadComments', comments => {
                runInAction(() => {
                    // this line will cause a warning as it is an action and we should say so
                    this.comments = comments // now this line by itself will cause mobx to give us warning
                })
            })

            this.hubConnection.on('ReceiveComment', comment => {
                runInAction(() => {
                    this.comments.unshift(comment) // unshift is to add this comment to the start of the array
                })
            })
        },

        stopHubConnection() {
            if(this.hubConnection?.state === HubConnectionState.Connected) {
                this.hubConnection.stop().catch(error => console.log('Error stopping connection: ', error))
            }
        }
    }));

    // now we want when the chat component is mounted to make the connection and we will use the useEffect for that
    // and we will write the useEffect inside the hook itself so merely the usage of the hook will cause a connection to signal r
    useEffect(()=>{
        if(activityId && !created.current) {
            commentStore.createHubConnection(activityId);
            created.current = true;
        }

        return () => {
            commentStore.stopHubConnection();
            commentStore.comments = [];
        }
    }, [activityId, commentStore]);

    // The key thing is that the function you pass to useEffect runs twice conceptually:

    // The effect body runs when the component mounts.
    // The function returned from the effect (return () => {...}) runs later, when:
    // the component unmounts, or
    // before the effect runs again because a dependency changed.

    // So your code behaves like this:

        // useEffect(() => {
        //     if(activityId) {
        //         commentStore.createHubConnection(activityId);
        //     }

        //     return () => {
        //         commentStore.stopHubConnection();
        //     }
        // }, [activityId, commentStore]);
    // Component Mounts

    // React executes:

        // if(activityId) {
        //     commentStore.createHubConnection(activityId);
        // }

    // The connection starts.

    // React then stores the cleanup function:

        // () => {
        //     commentStore.stopHubConnection();
        // }

    // but does not execute it yet.

    return {
        commentStore
    }
}