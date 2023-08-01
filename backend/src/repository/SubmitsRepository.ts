import { UserNameNotFoundError } from "../errors/username-not-found-error";
import { LeetcodeRefreshDataModel } from "../model/LeetcodeRefreshDataModel";
import { VjudgeProblemData } from "../model/VjudgeProblemData";
import { User} from "../model/schemas/userSchema";

export class SubmitsRepository {
    public async saveLeetcodeSubmissionStats(leetcodeRefreshData: LeetcodeRefreshDataModel) {
    
        const user = await User.findOne({username:leetcodeRefreshData.codegramUsername}, {vjudge:0});
        
        if(!user) {
            throw new UserNameNotFoundError(leetcodeRefreshData.codegramUsername, "leetcode");
        }

        user.leetcode = leetcodeRefreshData.leetcodeData;
        await user.save();
    }

    public async saveVjudgeSubmission({username, problem, platform} : VjudgeProblemData) {
        const user = await User.findOne({username:username}, {leetcode:0});
        
        if(!user || !user.vjudge?.acRecords) {
            throw new UserNameNotFoundError(username, "vjudge");
        }
        
        // Some reflection black magic to add the problem to the list corresponding to platform
        // for example, add problem to vjudge.acRecords.Kattis
        const key = platform as keyof typeof user.vjudge.acRecords;
        if(!user.vjudge.acRecords[key]) {
            user.vjudge.acRecords[key] = [];
        }
        user.vjudge.acRecords[key].push(problem);

        await user.save();
    }
}
