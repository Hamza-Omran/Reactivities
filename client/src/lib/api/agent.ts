import axios from "axios";

const sleep = (delay: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

const agent = axios.create({
    baseURL: import.meta.env.VITE_API_URL // we need to specify VITE_ and this will the vite to pass it to the js app
});

// interceptors perform operations on things that going to api and back from it
agent.interceptors.response.use(async response => {
    try {
        await sleep(1000)
        return response
    } catch (error) {
        console.log(error);
        return Promise.reject(error) // the promise can be rejected or resolved
    }
})


export default agent;