import { UserNameNotFoundError } from "../errors/username-not-found-error";
import { LeetcodeData } from "../model/LeetcodeData";
import { VjudgeProblemData } from "../model/VjudgeProblemData";
import { User} from "../model/schemas/userSchema";

export class SubmitsRepository {
    public async saveLeetcodeSubmissionStats(stats: LeetcodeData) {
    
        const user = await User.findOne({username:stats.username}, {vjudge:0});
        
        if(!user) {
            throw new UserNameNotFoundError(stats.username);
        }

        user.leetcode = stats;
        await user.save();
    }

    public async saveVjudgeSubmission({username, problem, platform} : VjudgeProblemData) {
        const user = await User.findOne({username:username}, {leetcode:0});
        
        if(!user || !user.vjudge?.acRecords) {
            throw new UserNameNotFoundError(username);
        }
        
        // Some reflection black magic to add the problem to the list corresponding to platform
        // for example, add problem to vjudge.acRecords.Kattis
        (user.vjudge.acRecords[platform as keyof typeof user.vjudge.acRecords]).push(problem);

        await user.save();
    }
}
