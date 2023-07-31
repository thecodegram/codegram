import { CronJob } from "cron";
import { getAndStoreLeetcodeUpdates, getAndStoreVjudgeUpdates, getUpdates } from "../services/UpdatesCollectorService";
import { UserRepository } from "../repository/UserRepository";


export class Scheduler {
  private userRepository: UserRepository
  constructor() {
    this.userRepository = new UserRepository();
  }
  private readonly leetcodeUpdatesCollectorJob = new CronJob('* * * * *', async () => {

    const userData = await this.userRepository.getAllUsernames();
    
    // we are querying external APIs, so we cannot do any load we want
    // Introduce batches of size <= 10 that we will process once in 0.2 seconds;
    const batchSize = 10;
    const delayBetweenBatches = 200;
    const totalBatches = Math.ceil(userData.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * batchSize;
    const endIndex = Math.min(startIndex + batchSize, userData.length);
    const batch = userData.slice(startIndex, endIndex);

    // Process the current batch of users concurrently using Promise.all
    await Promise.all(batch.map(u => getAndStoreLeetcodeUpdates(u.username!!)));

    // Introduce a delay between batches (in milliseconds)
    if (i < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  });

  private readonly vjudgeUpdatesCollectorJob = new CronJob('*/5 * * * *', async () => {

    const userData = await this.userRepository.getAllUsernames();
    
    // we are querying external APIs, so we cannot do any load we want
    // VJudge is most likely not as robust as LeetCode so reduce the load compared to Leetcode
    // Introduce batches of size <= 5 that we will process once in 0.5 seconds;
    const batchSize = 5;
    const delayBetweenBatches = 200;
    const totalBatches = Math.ceil(userData.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * batchSize;
    const endIndex = Math.min(startIndex + batchSize, userData.length);
    const batch = userData.slice(startIndex, endIndex);

    // Process the current batch of users concurrently
    await Promise.all(batch.map(u => getAndStoreVjudgeUpdates(u.username!!)));

    // Wait <delay> time before processing next batch;
    if (i < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

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