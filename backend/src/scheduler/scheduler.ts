import { CronJob } from "cron";
import VjudgeUpdateCollectingJob from "../job/VjudgeUpdateCollectingJob";
import LeetcodeUpdateCollectingJob from "../job/LeetcodeUpdateCollectingJob";
import UpdateRankingsJob from "../job/UpdateRankingsJob";


export class Scheduler {

  // schedule to run Leetcode Updates collection job every minute
  private readonly leetcodeUpdatesCollectorCronJob = new CronJob('* * * * *', new LeetcodeUpdateCollectingJob().run);

  // schedule to Vjudge Updates collection job every 5 minutes
  private readonly vjudgeUpdatesCollectorCronJob = new CronJob('*/5 * * * *', new VjudgeUpdateCollectingJob().run);

  // schedule to run Update Rankings job every 12 hours (12:00PM and 12:00 AM)
  private readonly updateRankingsCronJob = new CronJob('0 */12 * * *', new UpdateRankingsJob().run)

  public start() {
    this.leetcodeUpdatesCollectorCronJob.start();
    console.log("Started leetcode updates collection!");

    this.vjudgeUpdatesCollectorCronJob.start();
    console.log("Started vjudge updates collection!");

    this.updateRankingsCronJob.start();
    console.log("Scheduled the update rankings job!");
  }
  public stop() {
    console.log("Scheduler is stopping");
    if (this.leetcodeUpdatesCollectorCronJob.running) {
      this.leetcodeUpdatesCollectorCronJob.stop();
      console.log("Stopped leetcode updates collection");
    }
    if (this.vjudgeUpdatesCollectorCronJob.running) {
      this.vjudgeUpdatesCollectorCronJob.stop();
      console.log("Stopped vjudge updates collection");
    }
    if (this.updateRankingsCronJob.running) {
      this.updateRankingsCronJob.stop();
      console.log("Unscheduled the update rankings job");
    }
  }
}