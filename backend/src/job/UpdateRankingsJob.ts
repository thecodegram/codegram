import { User } from "../model/schemas/userSchema";
import { UserRepository } from "../repository/UserRepository";

export class UpdateRankingsJob {
  private readonly userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async run() {
    console.log(`${new Date().toLocaleTimeString()} Starting the update rankings job`);
    try {
      await this.updateAllUserScores();
      await this.userRepository.recomputeRanksForAllUsers();
      console.log(`${new Date().toLocaleTimeString()} Ranking job finished. Ranks are up-to-date now`);
    } catch (e) {
      console.log(`${new Date().toLocaleTimeString()} Ranking job failed`);
    }
  }

  private async updateAllUserScores() {
    const mongoIDs = await this.userRepository.getAllMongoIds();

    for (const mongoId of mongoIDs) {
      const newScore = await this.userRepository.calculateNewScoreForUser(mongoId);
      await this.userRepository.updateUserScore(mongoId, newScore);
    }
  }

  


}

export default UpdateRankingsJob;
