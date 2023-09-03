import { getLatestAcceptedSubmits, getSubmitStats } from "../api/leetcode";
import { userUpdateEventEmitter } from "../events/UserUpdateEventEmitter";
import { User } from "../model/schemas/userSchema";
import { getSubmissionStats } from "../api/vjudge";
import { UpdateEventData } from "../model/UpdateEventData";
import { refreshLeetcodeDataEventEmitter } from "../events/RefreshLeetcodeDataEventEmitter";
import { storeVjudgeSubmissionEventEmitter } from "../events/StoreVjudgeSubmissionEventEmitter";


export class UpdatesCollectorService {
  async getAndStoreLeetcodeUpdates(username: string) {
    const u = await User.findOne({ username: username });

    if (!u) {
      console.error(`User ${username} was not found in MongoDB. Data mismatch between the databases`);
    } else {
      try {
        const updates = await (async () => {
          if (u.leetcode?.username) {
            console.log(`${new Date().toLocaleTimeString()} getting leetcode updates for ${username}`)
            const newData = await getSubmitStats(u.leetcode.username);

            // get difference in total solved count from old data and new
            const solvedDifference =
              newData.submitStats?.acSubmissionNum[0].count!! -
              u.leetcode.submitStats?.acSubmissionNum[0].count!!;
            // if it changed (note: cannot decrease), query for <n=difference> last solved questions
            if (solvedDifference > 0) {
              console.log(
                `User ${u.username} has ${solvedDifference} new submit(s) on leetcode. (username: ${u.leetcode.username})`
              );
              const updates = await getLatestAcceptedSubmits(
                u.leetcode.username,
                solvedDifference
              );

              // once we have a list of problems that were solved since last check, emit an event for each of them
              updates.forEach((upd: any) => {
                const updateData: UpdateEventData = {
                  username: username,
                  platform: "leetcode",
                  problemTitle: upd.title,
                  problemTitleSlug: upd.titleSlug,
                  // leetcode updates are with 1 second precision, but js are 1 millisecond
                  timestamp: parseInt(upd.timestamp) * 1000
                }
                userUpdateEventEmitter.emit(updateData);
              });


              refreshLeetcodeDataEventEmitter.emit({ codegramUsername: username, leetcodeData: newData });

              return updates;
            }
            else {
              console.log(`No LeetCode updates for user ${username}`);
              return [];
            }
          } else return [];
        })();

        return updates;
      } catch (e) {
        console.error(`Failed to load leetcode updates for user ${username}. Error: ${e}`);
        return [];
      }
    }
  }


  private generateVjudgeUpdateEvent(username: string, platform: string, problemName: string): UpdateEventData {
    const updateData: UpdateEventData = {
      username: username,
      platform: "vjudge",
      problemTitle: platform + '-' + problemName,
      problemTitleSlug: platform + '-' + problemName,
      timestamp: Date.now()
    }

    return updateData;
  }

  async getAndStoreVjudgeUpdates(username: string) {
    const u = await User.findOne({ username: username }, { leetcode: 0 });

    if (!u) {
      console.error(`User ${username} was not found in MongoDB. Data mismatch between the databases`);
    } else {
      try {
        const updates = await (async () => {
          if (u.vjudge?.username) {

            console.log(`${new Date().toLocaleTimeString()} getting vjudge updates for ${username}`);
            const latestData = await getSubmissionStats(u.vjudge.username);

            const storedAcData = u.vjudge.acRecords!!;
            const storedFailedData = u.vjudge.failRecords!!;

            const keys: string[] = [
              'AtCoder',
              'CSES',
              'CodeChef',
              'CodeForces',
              'DMOJ',
              'EOlymp',
              'Gym',
              'Kattis',
              'SPOJ',
              'TopCoder',
              'UVA',
              'HDU',
              'HackerRank',
              'LightOJ',
              'SGU',
              'URAL',
              'UVALive'
            ];

            const updates = [];
            // go through all platformNames and check if there are updates for any of them
            for (var i = 0; i < keys.length; ++i) {
              const key: string = keys[i];
              const oldValues: string[] = (storedAcData[key as keyof typeof storedAcData] ?? []).sort();
              const newValues: string[] = (latestData.acRecords[key] ? (latestData.acRecords[key].sort()) : []);

              // something changed!
              if (oldValues.length < newValues.length) {
                console.log(
                  `User ${u.username} has solved something new on vjudge. (username: ${u.vjudge.username})`
                );
                // 2-pointer approach to finding the different elements in 2 lists
                for (var i = 0, j = i; i < oldValues.length; ++i, ++j) {
                  while (j < newValues.length && oldValues[i] !== newValues[j]) {
                    const update = this.generateVjudgeUpdateEvent(username, key, newValues[j]);
                    updates.push(update);

                    // store update to be displayable in feed
                    userUpdateEventEmitter.emit(update);
                    // update submits data to know about this problem
                    storeVjudgeSubmissionEventEmitter.emit({
                      platform: key,
                      username: username,
                      problem: newValues[j]
                    });

                    ++j;
                  }
                }
              }
            }
            if (!updates.length) {
              console.log(`No Vjudge updates for user ${username}`);
            }
            else {
              console.log(`${username} has ${updates.length} new submit(s) on VJudge`)
            }
            return updates;
          } else {
            return [];
          }
        })();

        return updates;
      } catch (e) {
        console.error(`Failed to load vjudge updates for user ${username}. Error: ${e}`);
        return [];
      }
    }
  }

  async getUpdates(username: string) {
    const leetcodeUpdatesPromise = this.getAndStoreLeetcodeUpdates(username);
    const vjudgeUpdatesPromise = this.getAndStoreVjudgeUpdates(username);

    const leetcodeUpdates = await leetcodeUpdatesPromise;
    const vjudgeUpdates = await vjudgeUpdatesPromise;

    return { leetcodeUpdates: leetcodeUpdates, vjudgeUpdates: vjudgeUpdates };
  }
}

export const updatesCollectorService = new UpdatesCollectorService();
