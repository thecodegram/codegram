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
      const newScore = await this.calculateNewScoreForUser(mongoId);
      await this.userRepository.updateUserScore(mongoId, newScore);
    }
  }

  private async calculateNewScoreForUser(mongoId: string) {
    console.log(`Updating score for user ${mongoId}`);
    const user = await User.findById(mongoId, { password: 0 });
    let leetcodeCount = 0;
    if (
      user?.leetcode?.submitStats?.acSubmissionNum[0]?.count != undefined
    ) {
      leetcodeCount = user.leetcode.submitStats.acSubmissionNum[0].count;
    }

    let vjudgeCount = 0;
    if (user?.vjudge?.acRecords) {
      for (const platform in user.vjudge.acRecords) {
        const platformKey = platform as keyof typeof user.vjudge.acRecords;
        if (Array.isArray(user.vjudge.acRecords[platformKey])) {
          vjudgeCount += user.vjudge.acRecords[platformKey].length;
        }
      }
    }

    return leetcodeCount + vjudgeCount;
  }


}

export default UpdateRankingsJob;
