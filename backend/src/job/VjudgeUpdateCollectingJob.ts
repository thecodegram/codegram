import { vjudgeUpdatesCollectorService } from "../services/updates-collection/VjudgeUpdatesCollectorService";
import { userRepository } from "../repository/UserRepository";

// Job responsible for collecting updates from VJudge and updating our db
export class VjudgeUpdateCollectingJob {
  async run() {
    const mongoIDs = await userRepository.getAllMongoIds();

    // we are querying external APIs, so we cannot do any load we want
    // VJudge is most likely not as robust as LeetCode so reduce the load compared to Leetcode
    // Introduce batches of size <= 5 that we will process once in 0.5 seconds;
    const batchSize = 5;
    const delayBetweenBatches = 200;
    const totalBatches = Math.ceil(mongoIDs.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * batchSize;
      const endIndex = Math.min(startIndex + batchSize, mongoIDs.length);
      const batch = mongoIDs.slice(startIndex, endIndex);

      // Process the current batch of users concurrently
      await Promise.all(batch.map(id =>
        vjudgeUpdatesCollectorService.getAndStoreUpdates(id)));

      // Wait <delay> time before processing next batch;
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  }
}

export default VjudgeUpdateCollectingJob;
