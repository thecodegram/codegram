import { getLatestAcceptedSubmits, getSubmitStats } from "../api/leetcode";
import { UserNameNotFoundError } from "../errors/username-not-found-error";
import { userUpdateEventEmitter } from "../events/UserUpdateEventEmitter";
import { UpdateEventData } from "../repository/EventRepository";
import { User } from "../model/schemas/userSchema";

export async function getLeetcodeUpdates(username: string) {
  const u = await User.findOne({ username: username });

  if (!u) {
    throw new UserNameNotFoundError(username, "leetcode");
  } else {
    const updates = await (async () => {
      if (u.leetcode?.username) {
        const newData = await getSubmitStats(u.leetcode.username);

        // get difference in total solved count from old data and new
        const solvedDifference =
          newData.submitStats?.acSubmissionNum[0].count!! -
          u.leetcode.submitStats?.acSubmissionNum[0].count!!;
        // if it changed (note: cannot decrease), query for <n=difference> last solved questions
        if (solvedDifference > 0) {
          console.log(
            `User ${u.username} has solved something new on leetcode. (username: ${u.leetcode.username})`
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
              timestamp: parseInt(upd.timestamp),
            };
            userUpdateEventEmitter.emit(updateData);
          });
          return updates;
        } else {
          console.log(`No LeetCode updates for user ${username}`);
          return [];
        }
      } else return [];
    })();

    return updates;
  }
}

export async function getVjudgeUpdates(username: string) {
  // TODO: implement
  return [];
}

export async function getUpdates(username: string) {
  const leetcodeUpdatesPromise = getLeetcodeUpdates(username);
  const vjudgeUpdatesPromise = getVjudgeUpdates(username);

  const leetcodeUpdates = await leetcodeUpdatesPromise;
  const vjudgeUpdates = await vjudgeUpdatesPromise;

  console.log(leetcodeUpdates);

  return { leetcodeUpdates: leetcodeUpdates, vjudgeUpdates: vjudgeUpdates };
}
