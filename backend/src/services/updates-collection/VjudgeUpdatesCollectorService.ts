import { userUpdateEventEmitter } from "../../events/UserUpdateEventEmitter";
import { User } from "../../model/schemas/userSchema";
import { vjudgeApi } from "../../api/vjudge";
import { UpdateEventData } from "../../model/UpdateEventData";
import { storeVjudgeSubmissionEventEmitter } from "../../events/StoreVjudgeSubmissionEventEmitter";
import { vjudgeStatsSchema } from "../../model/schemas/vjudgeStatsSchema";
import { IUpdatesCollectorService } from "./IUpdatesCollectorService";


export class VjudgeUpdatesCollectorService implements IUpdatesCollectorService {
  getPlatformName(): string {
    return "VJudge";
  }

  private generateVjudgeUpdateEvent(userId: string, username: string, platform: string, problemName: string): UpdateEventData {
    const updateData: UpdateEventData = {
      id: userId,
      username: username,
      platform: "vjudge",
      problemTitle: platform + '-' + problemName,
      problemTitleSlug: platform + '-' + problemName,
      timestamp: Date.now()
    }

    return updateData;
  }

  async getAndStoreUpdates(userId: string): Promise<UpdateEventData[]> {
    const u = await User.findOne({ _id: userId }, { leetcode: 0 });

    if (!u) {
      console.error(`User ${userId} was not found in MongoDB. Data mismatch between the databases`);
      return [];
    } else {
      try {
        const username= u.username;
        const updates = await (async () => {
          if (u.vjudge?.username) {

            console.log(`${new Date().toLocaleTimeString()} getting vjudge updates for ${userId}`);
            const latestData = await vjudgeApi.getSubmissionStats(u.vjudge.username);
            // map of (platform, [problems]) of accepted submissions from vjudge
            const storedAcData = u.vjudge.acRecords!!;
            // container for updates found for this user
            const updates = [];
            // get a list of platform names in vjudge
            const vjudgePlatforms = (vjudgeStatsSchema.obj.acRecords as any).type;

            // go through all platform names and check if there are updates for any of them
            for (const platform in vjudgePlatforms) {
              const oldValues: string[] = (storedAcData[platform as keyof typeof storedAcData] ?? []).sort();
              const newValues: string[] = (latestData.acRecords[platform] ? (latestData.acRecords[platform].sort()) : []);

              // something changed!
              if (oldValues.length < newValues.length) {
                console.log(
                  `User ${userId} has solved something new on vjudge. (username: ${u.vjudge.username})`
                );

                const emittionPromises: Promise<any>[] = [];
                // 2-pointer approach to finding the different elements in 2 lists
                for (var i = 0, j = i; j < newValues.length; ++i, ++j) {

                  // generate an update event if current value in old and new lists dont match
                  // or if there are new submissions at the end of the new list
                  while (j < newValues.length && (i >= oldValues.length || oldValues[i] !== newValues[j])) {
                    const update = this.generateVjudgeUpdateEvent(userId, username, platform, newValues[j]);
                    updates.push(update);

                    // store update to be displayable in feed
                    emittionPromises.push(userUpdateEventEmitter.emit(update));
                    // update submits data to know about this problem
                    storeVjudgeSubmissionEventEmitter.emit({
                      platform: platform,
                      username: username,
                      problem: newValues[j]
                    });

                    ++j;
                  }
                }

                await Promise.all(emittionPromises);
              }
            }
            if (!updates.length) {
              console.log(`No Vjudge updates for user ${userId}`);
            }
            else {
              console.log(`${userId} has ${updates.length} new submit(s) on VJudge`)
            }
            return updates;
          } else {
            return [];
          }
        })();
        console.log(updates);
        return updates;
      } catch (e) {
        console.error(`Failed to load vjudge updates for user ${userId}. Error: ${e}`);
        return [];
      }
    }
  }
}

export const vjudgeUpdatesCollectorService = new VjudgeUpdatesCollectorService();
