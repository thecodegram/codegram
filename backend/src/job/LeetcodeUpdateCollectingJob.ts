import { updatesCollectorService } from "../services/UpdatesCollectorService";
import { userRepository } from "../repository/UserRepository";

// Job responsible for collecting updates from Leetcode and updating the db
export class LeetcodeUpdateCollectingJob {
  async run() {
    const userData = await userRepository.getAllUsernames();

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
      await Promise.all(batch.map(u =>
        updatesCollectorService.getAndStoreLeetcodeUpdates(u.username!!)));

      // Introduce a delay between batches (in milliseconds)
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  }

}

export default LeetcodeUpdateCollectingJob;
