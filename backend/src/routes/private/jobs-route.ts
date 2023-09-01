import express, { Request, Response } from "express";
import UpdateRankingsJob from "../../job/UpdateRankingsJob";
import LeetcodeUpdateCollectingJob from "../../job/LeetcodeUpdateCollectingJob";
import VjudgeUpdateCollectingJob from "../../job/VjudgeUpdateCollectingJob";

const router = express.Router();

router.post("/leetcode", async (req: Request, res: Response) => {
    try {
        await new LeetcodeUpdateCollectingJob().run();
        res.status(200).json({ message: 'LeetCode updates job has finished successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'LeetCode updates job failed.' });
    }

});

router.post("/vjudge", async (req: Request, res: Response) => {
    try {
        await new VjudgeUpdateCollectingJob().run();
        res.status(200).json({ message: 'VJudge updates job has finished successfully' })
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'VJudge updates job failed.' });
    }
});

router.post("/rank", async (req: Request, res: Response) => {
    try {
        await new UpdateRankingsJob().run();
        res.status(200).json({ message: 'The Ranking Job has finished successfully' })
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'The Ranking Job failed.' });
    }
});

module.exports = router;