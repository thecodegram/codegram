import express, { Request, Response } from "express";
import UpdateRankingsJob from "../../job/UpdateRankingsJob";
import LeetcodeUpdateCollectingJob from "../../job/LeetcodeUpdateCollectingJob";
import VjudgeUpdateCollectingJob from "../../job/VjudgeUpdateCollectingJob";

const router = express.Router();

router.post("/leetcode", async (req: Request, res: Response) => {
    new LeetcodeUpdateCollectingJob().run();

    res.status(200).json({message: 'started the leetcode updates job'})
});

router.post("/vjudge", async (req: Request, res: Response) => {
    new VjudgeUpdateCollectingJob().run();

    res.status(200).json({message: 'started the vjudge updates job'})
});

router.post("/rank", async (req: Request, res: Response) => {
    new UpdateRankingsJob().run();

    res.status(200).json({message: 'started the ranking job'})
});

module.exports = router;