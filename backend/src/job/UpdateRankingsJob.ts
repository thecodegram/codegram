import { userRepository } from "../repository/UserRepository";

export class UpdateRankingsJob {
  async run() {
    console.log(`${new Date().toLocaleTimeString()} Starting the update rankings job`);
    try {
      await this.updateAllUserScores();
      await userRepository.recomputeRanksForAllUsers();
      console.log(`${new Date().toLocaleTimeString()} Ranking job finished. Ranks are up-to-date now`);
    } catch (e) {
      console.log(`${new Date().toLocaleTimeString()} Ranking job failed`);
    }
  }

  private async updateAllUserScores() {
    const mongoIDs = await userRepository.getAllMongoIds();

    for (const mongoId of mongoIDs) {
      const newScore = await userRepository.calculateNewScoreForUser(mongoId);
      await userRepository.updateUserScore(mongoId, newScore);
    }
  }
}

export default UpdateRankingsJob;

