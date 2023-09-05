import EventEmitter from "events";
import { eventRepository } from "../repository/EventRepository";
import { UpdateEventData } from "../model/UpdateEventData";
import { PubSub } from '@google-cloud/pubsub';

export class UserUpdateEventEmitter {
  private eventEmitter: EventEmitter;
  private readonly EVENT_NAME = "user-update";
  private readonly pubSubClient = new PubSub();

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.on(
      this.EVENT_NAME,
      async (updateData: UpdateEventData) => {
        await eventRepository.saveEvent(updateData);
      }
    );
  }

  async emit(data: UpdateEventData) {
    this.eventEmitter.emit(this.EVENT_NAME, data);

    // send update to PubSub for other integrations
    try {
      const topicName = `update_events_user_${data.id}`;
      const topic = this.pubSubClient.topic(topicName);

      const [exists] = await topic.exists();

      if (!exists) {
        await topic.create();
      }

      const message = Buffer.from(JSON.stringify(data));
      const messageId = await topic.publishMessage({
        data: message
      });
      console.log(`Message ${messageId} published to ${topicName}`);
    } catch (e) {
      console.error(e);
    }
  }
}

export const userUpdateEventEmitter = new UserUpdateEventEmitter();
