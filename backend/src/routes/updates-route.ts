import express, { Request, Response } from "express";
import updateRankingsJob from "../job/RankingJob";
import { pool } from "../db/db";
import { EventRepository } from "../repository/EventRepository";

const router = express.Router();
const eventRepository = new EventRepository();

router.get("/", [], async (req: Request, res: Response) => {
  const sessionUsername = req.session.username;
  const data = req.body;

  // get the query for all the user id's that this person is following (friends)
  // conjunction with your own event updates conjunction with events from the people
  // that you are following

  // data json = {
  // "groupIds": [],
  // "following": false,
  // "currentUser" : true,
  // "from": 0,
  // "upto": 15 // kinda pagination?
  // }
});

////TESTING ONLY
router.get("/testUpdateRankings", async (req: Request, res: Response) => {
  try {
    await updateRankingsJob();
    res.status(200).send("Rankings updated successfully.");
  } catch (err) {
    console.error("An error occurred:", err);
    res.status(500).send("An error occurred while updating the rankings.");
  }
});

////TESTING ONLY
router.get("/getAllRanks", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM users ORDER BY current_rank ASC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("An error occurred:", err);
    res.status(500).send("An error occurred while getting the rankings.");
  }
});

router.post("/like", async (req: Request, res: Response) => {
  try {
    const { user_id, event_id } = req.body;
    const result = await eventRepository.toggleLike(user_id, event_id);

    if (result.success) {
      res.status(200).json(result.message);
    } else {
      res.status(500).json(result.message);
    }
  } catch (err) {
    console.error("An error occurred:", err);
    res.status(500).send("An error occurred while toggling the like.");
  }
});

module.exports = router;
