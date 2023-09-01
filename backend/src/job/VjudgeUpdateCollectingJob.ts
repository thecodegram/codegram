import { updatesCollectorService } from "../services/UpdatesCollectorService";
import { userRepository } from "../repository/UserRepository";

// Job responsible for collecting updates from VJudge and updating our db
export class VjudgeUpdateCollectingJob {
  async run() {
    const userData = await userRepository.getAllUsernames();

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
      await Promise.all(batch.map(u =>
        updatesCollectorService.getAndStoreVjudgeUpdates(u.username!!)));

      // Wait <delay> time before processing next batch;
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  }
}

export default VjudgeUpdateCollectingJob;
