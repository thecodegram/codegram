import EventEmitter from "events";
import { LeetcodeData } from "../model/LeetcodeData";
import { SubmitsRepository } from "../repository/SubmitsRepository";
import { VjudgeProblemData } from "../model/VjudgeProblemData";

export class StoreVjudgeSubmissionEventEmitter {
  private eventEmitter: EventEmitter;
  private readonly EVENT_NAME = "store-vjudge-submission";
  private submitsRepository: SubmitsRepository;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.submitsRepository = new SubmitsRepository();
    //TODO: setup things for GCP Pub/Sub

    this.eventEmitter.on(
      this.EVENT_NAME,
      async (vjudgeProblemData: VjudgeProblemData) => {
        await this.submitsRepository.saveVjudgeSubmission(vjudgeProblemData);
      }
    );
  }

  emit(vjudgeProblemData: VjudgeProblemData) {
    this.eventEmitter.emit(this.EVENT_NAME, vjudgeProblemData);
  }
}

export const storeVjudgeSubmissionEventEmitter = new StoreVjudgeSubmissionEventEmitter();
