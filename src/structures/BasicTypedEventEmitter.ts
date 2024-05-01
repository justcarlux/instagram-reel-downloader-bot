import EventEmitter from "events";

export type EventData = {
    [key: string]: (...args: any[]) => void
}

export class BasicTypedEventEmitter<Events extends EventData> {

    public emitter = new EventEmitter();
    public on<EventName extends keyof Events & string>(
        name: EventName,
        listener: Events[EventName]
    ) {
        this.emitter.on(name, listener as any);
    } 

    public once<EventName extends keyof Events & string>(
        name: EventName,
        listener: Events[EventName]
    ) {
        this.emitter.once(name as string, listener as any);
    } 

    public emit<EventName extends keyof Events & string>(
        name: EventName,
        ...args: Parameters<Events[EventName]>
    ) {
        this.emitter.emit(name, ...args);
    }

    public removeAllListeners() {
        this.emitter.removeAllListeners();
    }
    
}