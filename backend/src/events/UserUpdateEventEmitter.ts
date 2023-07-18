import EventEmitter from 'events';

export interface UpdateEventData {
    username: string,
    platform: string,
    problemTitle: string,
    problemTitleSlug: string, // for "Three sum" titleSlug is "three-sum", needed to craft problem url
    timestamp: number
}
export class UserUpdateEventEmitter{
    private eventEmitter: EventEmitter;
    private readonly EVENT_NAME = "user-update"
    constructor() {
        this.eventEmitter = new EventEmitter();
        //TODO: setup things for GCP Pub/Sub

        this.eventEmitter.on(this.EVENT_NAME, (updateData) => {
            console.log("Update event fired", updateData)

            /*
            TODO: 
                1) store updateEvent in postgres db
                2) send the event to google pubsub (if we have time) - alternatively send on emit
            */
        })
    }
  
    emit(data : UpdateEventData) {
        this.eventEmitter.emit(this.EVENT_NAME, data);

        // TODO: send to pub sub?
    }
}

export const userUpdateEventEmitter = new UserUpdateEventEmitter();