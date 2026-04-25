import axios from "axios";
import { store } from "../stores/store";
import { toast } from "react-toastify";
import { router } from "../../app/router/Routes";

const sleep = (delay: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}


// now this file is not react related but because mobx is not react specific, we can do something here to update our mobx store 
// and then using mobx-react-lite integration to use it in our components so they react to any actions that we call from agent.ts
const agent = axios.create({
    baseURL: import.meta.env.VITE_API_URL // we need to specify VITE_ and this will the vite to pass it to the js app
});



// interceptors perform operations on things that going to api and back from it

agent.interceptors.request.use(config=>{
    store.uiStore.isBusy();
    return config;
})

agent.interceptors.response.use(
    async response => {
        // now after removing the try and catch the error messages should be printed int he console tab
    // try {
    //     await sleep(1000) // just to see the loading indicators in our ui
    //     return response
    // } catch (error) {
    //     console.log(error);
    //     return Promise.reject(error) // the promise can be rejected or resolved // the console doesn't show in chrome dev tool so it is pointless
    // } finally {
    //     store.uiStore.isIdle();
    // }

        await sleep(1000);
        store.uiStore.isIdle();
        return response;
    },
    async error => {
        await sleep(1000);
        store.uiStore.isIdle();

        // in the network tab in the client dev tools the preview tab shows the data
        const {status, data} = error.response;
        switch(status) {
            case 400:
                if(data.errors) {
                    const modalStateErrors = [];
                    for(const key in data.errors){
                        if(data.errors[key]){
                            modalStateErrors.push(data.errors[key])
                        }
                    }
                    throw modalStateErrors.flat(); // the flat function is to make it an array of strings rather than the complexity it is
                }
                else{
                    toast.error(data);
                }
                break;
            case 401: 
                toast.error('Unauthorized');
                break;
            case 404: 
                router.navigate('/not-found')
                break;
            case 500: 
                router.navigate('/server-error', {state: {error: data}}) // basically here we are sending the data too
                break;
            default:
                break;
        }

        // console.log('axios error:' + error);
        return Promise.reject(error);
    }
);


export default agent;