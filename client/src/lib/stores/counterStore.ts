import { makeAutoObservable } from "mobx";

// the way we are using mobx is by creating class

export default class CounterStore {
    title = 'Counter Store';
    count = 42;
    events: string[]=[
        `Initial count is ${this.count}`
    ];

    constructor() {
        // rather than this we can make it auto detect
        // makeObservable(this, {
        //     title: observable, 
        //     count: observable,
        //     increment: action,
        //     decrement: action // if we will use normal function then we write action.bound
        // })
        makeAutoObservable(this)
    }

    // if we use an arrow function then this is going to be bound directly to the class as a class method, 
    // however if we made it as a normal function we will need to do some steps to make it bounded
    // classes have a bit of quirks  that can make the life a little bit confusing for devs like using 
    // the keyword this and the methods as we mentioned
    increment = (amount = 1) => {
        this.count += amount;
        this.events.push(`Incremented by ${amount} - count is now ${this.count}`);
    }

    decrement = (amount = 1) => {
        this.count -= amount;
        this.events.push(`Decremented by ${amount} - count is now ${this.count}`);
    }

    // every time the events is updated the return from the evenCount is also updated
    get eventCount() {
        return this.events.length;
    }

}