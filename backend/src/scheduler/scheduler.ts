import { CronJob } from "cron";
import { getAndStoreLeetcodeUpdates, getAndStoreVjudgeUpdates, getUpdates } from "../services/UpdatesCollectorService";
import { UserRepository } from "../repository/UserRepository";


export class Scheduler {
  private userRepository: UserRepository
  constructor() {
    this.userRepository = new UserRepository();
  }
  private readonly leetcodeUpdatesCollectorJob = new CronJob('*/30 * * * *', async () => {

    const userData = await this.userRepository.getAllUsernames();

    await Promise.all(userData.map(u => {
      // should probably change this to use id
      getAndStoreLeetcodeUpdates(u.username!!)
    }))

  });

  private readonly vjudgeUpdatesCollectorJob = new CronJob('5 * * * *', async () => {

    const userData = await this.userRepository.getAllUsernames();

    await Promise.all(userData.map(u => {
      // should probably change this to use id
      getAndStoreVjudgeUpdates(u.username!!)
    }))

  });

  public start() {
    this.leetcodeUpdatesCollectorJob.start();
    this.vjudgeUpdatesCollectorJob.start();
    console.log("Started leetcode updates collection!");
    console.log("Started vjudge updates collection!");
  }
  public stop() {
    console.log("Scheduler is stopping");
    if (this.leetcodeUpdatesCollectorJob.running) {
      this.leetcodeUpdatesCollectorJob.stop();
      console.log("Stopped leetcode updates collection");
    }
    if (this.vjudgeUpdatesCollectorJob.running) {
      this.vjudgeUpdatesCollectorJob.stop();
      console.log("Stopped vjudge updates collection");
    }
  }
}