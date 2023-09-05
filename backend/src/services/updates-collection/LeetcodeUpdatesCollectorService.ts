import { leetcodeApi } from "../../api/leetcode";
import { userUpdateEventEmitter } from "../../events/UserUpdateEventEmitter";
import { User } from "../../model/schemas/userSchema";
import { UpdateEventData } from "../../model/UpdateEventData";
import { refreshLeetcodeDataEventEmitter } from "../../events/RefreshLeetcodeDataEventEmitter";
import { IUpdatesCollectorService } from "./IUpdatesCollectorService";


export class LeetcodeUpdatesCollectorService implements IUpdatesCollectorService {
  getPlatformName(): string {
    return "Leetcode";
  }
  async getAndStoreUpdates(userId: string): Promise<UpdateEventData[]> {
    const u = await User.findOne({ _id: userId });

    if (!u) {
      console.error(`User ${userId} was not found in MongoDB. Data mismatch between the databases`);
      return [];
    } else {
      try {
        const username = u.username;
        const updates = await (async () => {
          if (u.leetcode?.username) {
            console.log(`${new Date().toLocaleTimeString()} getting leetcode updates for ${userId}`)
            const newData = await leetcodeApi.getSubmitStats(u.leetcode.username);

            // get difference in total solved count from old data and new
            const solvedDifference =
              newData.submitStats?.acSubmissionNum[0].count!! -
              u.leetcode.submitStats?.acSubmissionNum[0].count!!;
            // if it changed (note: cannot decrease), query for <n=difference> last solved questions
            if (solvedDifference > 0) {
              console.log(
                `User ${u.username} has ${solvedDifference} new submit(s) on leetcode. (username: ${u.leetcode.username})`
              );
              const updatesData = await leetcodeApi.getLatestAcceptedSubmits(
                u.leetcode.username,
                solvedDifference
              );

              // once we have a list of problems that were solved since last check, emit an event for each of them
              const updateEvents = await Promise.all(updatesData.map(
                async (upd: any) => {
                  const updateEvent: UpdateEventData = {
                    id: userId,
                    username: username,
                    platform: "leetcode",
                    problemTitle: upd.title,
                    problemTitleSlug: upd.titleSlug,
                    // leetcode updates are with 1 second precision, but js are 1 millisecond
                    timestamp: parseInt(upd.timestamp) * 1000
                  }
                  console.log("emitting actuawwy");
                  await userUpdateEventEmitter.emit(updateEvent);

                  return updateEvent;
                }));
              refreshLeetcodeDataEventEmitter.emit({ codegramUsername: username, leetcodeData: newData });

              return updateEvents;
            }
            else {
              console.log(`No LeetCode updates for user ${userId}`);
              return [];
            }
          } else return [];
        })();

        return updates;
      } catch (e) {
        console.error(`Failed to load leetcode updates for user ${userId}. Error: ${e}`);
        return [];
      }
    }
  }
}

export const leetcodeUpdatesCollectorService = new LeetcodeUpdatesCollectorService();
