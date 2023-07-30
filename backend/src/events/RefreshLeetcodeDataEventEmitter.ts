import EventEmitter from "events";
import { LeetcodeData } from "../model/LeetcodeData";
import { SubmitsRepository } from "../repository/SubmitsRepository";

export class RefreshLeetcodeDataEventEmitter {
  private eventEmitter: EventEmitter;
  private readonly EVENT_NAME = "refresh-leetcode-data";
  private submitsRepository: SubmitsRepository;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.submitsRepository = new SubmitsRepository();
    //TODO: setup things for GCP Pub/Sub

    this.eventEmitter.on(
      this.EVENT_NAME,
      async (leetcodeData: LeetcodeData) => {
        console.log("Refresh leetcode data event fired", leetcodeData);
        await this.submitsRepository.saveLeetcodeSubmissionStats(leetcodeData);
      }
    );
  }

  emit(leetcodeData: LeetcodeData) {
    this.eventEmitter.emit(this.EVENT_NAME, leetcodeData);
    // TODO: send to pub sub?
  }
}

export const refreshLeetcodeDataEventEmitter = new RefreshLeetcodeDataEventEmitter();
