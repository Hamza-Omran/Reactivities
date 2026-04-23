import axios from "axios";
import { store } from "../stores/store";

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

agent.interceptors.response.use(async response => {
    try {
        await sleep(1000)
        return response
    } catch (error) {
        console.log(error);
        return Promise.reject(error) // the promise can be rejected or resolved
    } finally {
        store.uiStore.isIdle();
    }
})


export default agent;