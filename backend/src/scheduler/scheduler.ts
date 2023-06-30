import { CronJob } from "cron";
import { makeGraphQLRequest } from "../api/leetcode";
import { getUserIDs } from "../model/users";


const job = new CronJob('*/2 * * * *', () => {
    for (const userId of getUserIDs()) {
      makeGraphQLRequest(userId);
    }
  });

export const startJob = () => job.start();
export const stopJob = () => job.stop();