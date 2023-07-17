import { CronJob } from "cron";
import { User } from "../model/schemas/userSchema";
import { getUpdates } from "../services/UpdatesCollectorService";


const job = new CronJob('*/2 * * * *', async () => {
    const userData = await User.find({}, {
      _id:1,
      username:1,
    })

    await Promise.all(userData.map(u => {
      // should probably change this to use id
      getUpdates(u.username!!)
    }))

  });

export const startJob = () => job.start();
export const stopJob = () => job.stop();