import { useContext } from "react";
import { StoreContext } from "../stores/store";

// the hook is to be able to use our store

export function useStore() {
    // to be able to use the context we created
    return useContext(StoreContext)
}