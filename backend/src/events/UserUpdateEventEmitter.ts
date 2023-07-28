import EventEmitter from "events";
import { EventRepository } from "../repository/EventRepository";
import { UpdateEventData } from "../model/UpdateEventData";

export class UserUpdateEventEmitter {
  private eventEmitter: EventEmitter;
  private readonly EVENT_NAME = "user-update";
  private eventRepository: EventRepository;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventRepository = new EventRepository();
    //TODO: setup things for GCP Pub/Sub

    this.eventEmitter.on(
      this.EVENT_NAME,
      async (updateData: UpdateEventData) => {
        console.log("Update event fired", updateData);
        await this.eventRepository.saveEvent(updateData);
      }
    );
  }

  emit(data: UpdateEventData) {
    this.eventEmitter.emit(this.EVENT_NAME, data);
    // TODO: send to pub sub?
  }
}

export const userUpdateEventEmitter = new UserUpdateEventEmitter();
