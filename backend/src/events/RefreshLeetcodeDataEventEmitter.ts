import EventEmitter from "events";
import { LeetcodeData } from "../model/LeetcodeData";
import { SubmitsRepository } from "../repository/SubmitsRepository";
import { LeetcodeRefreshDataModel } from "../model/LeetcodeRefreshDataModel";

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
      async (leetcodeRefreshData: LeetcodeRefreshDataModel) => {
        await this.submitsRepository.saveLeetcodeSubmissionStats(leetcodeRefreshData);
      }
    );
  }

  emit(leetcodeData: LeetcodeRefreshDataModel) {
    this.eventEmitter.emit(this.EVENT_NAME, leetcodeData);
    // TODO: send to pub sub?
  }
}

export const refreshLeetcodeDataEventEmitter = new RefreshLeetcodeDataEventEmitter();
