import { makeAutoObservable } from "mobx";

export class ActivityStore {
    filter = 'all';
    startDate = new Date().toISOString(); // we converted to string so it goes as a string to our api

    constructor() {
        makeAutoObservable(this);
    }

    setFilter = (filter: string) => {
        this.filter = filter;
    }
    
    setStartDate = (date: Date) => {
        this.startDate = date.toISOString();
    }
}