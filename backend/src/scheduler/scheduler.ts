import { CronJob } from "cron";
import { getSubmitStats } from "../api/leetcode";
import { getUserIDs } from "../model/users";


const job = new CronJob('*/2 * * * *', () => {
    for (const userId of getUserIDs()) {
      getSubmitStats(userId);
    }
  });

export const startJob = () => job.start();
export const stopJob = () => job.stop();