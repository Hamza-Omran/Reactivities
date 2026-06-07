import { createContext } from "react";
import CounterStore from "./counterStore";
import { UiStore } from "./uiStore";
import { ActivityStore } from "./activityStore";

// this file is to define the different stores inside our global store

interface Store {
    counterStore: CounterStore // our classes can be used too as types in Js
    uiStore: UiStore
    activityStore: ActivityStore
}

export const store: Store = {
    counterStore: new CounterStore(),
    uiStore: new UiStore(),
    activityStore: new ActivityStore()
}

// we make it as context so we can use it in other react components
export const StoreContext = createContext(store);