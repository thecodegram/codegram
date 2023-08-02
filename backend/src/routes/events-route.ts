import express, { Request, Response } from "express";
import { pool } from "../db/db";
import { EventRepository } from "../repository/EventRepository";
import { UserRepository } from "../repository/UserRepository";
import { UserNameNotFoundError } from "../errors/username-not-found-error";
import updateRankingsJob, { UpdateRankingsJob } from "../job/UpdateRankingsJob";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    var { username, platform, offset, limit } = req.query;
    const currentUserId = req.session.userId!!;
    const eventRepository = new EventRepository();
    const userRepository = new UserRepository();
    if (!username || !offset || !limit) {
        res.sendStatus(400).end();
    } else {
        try {
            username = username as string;
            offset = offset as string;
            limit = limit as string;
            platform = platform as string | undefined;
            const user = await userRepository.getUser(username);

            if (!user) {
                throw new UserNameNotFoundError(username, "codegram");
            }
            const result = await eventRepository
                .getEventsForOneUser(user.id, currentUserId, parseInt(offset), parseInt(limit), platform ? parseInt(platform) : undefined);

            res.json(result);
        } catch (e) {
            if (e instanceof UserNameNotFoundError) {
                res.status(404).send("User not found");
            }
            else {
                console.error(e);
                res.sendStatus(500);
            }
        }
    }
});

router.get("/feed", [], async (req: Request, res: Response) => {
    var { offset, limit } = req.query;
    const username = req.session.username;
    const eventRepository = new EventRepository();
    try {
        if (!username) {
            throw new UserNameNotFoundError("", "");
        }
        offset = offset as string;
        limit = limit as string;

        // userId has to be not null to get to this protected endpoint
        const userId = req.session.userId!!;

        const result = await eventRepository
            .getEventsVisibleToUser(userId, parseInt(offset), parseInt(limit));

        res.json(result);
    } catch (e) {
        if (e instanceof UserNameNotFoundError) {
            res.status(404).send("User not found");
        }
        else {
            console.error(e);
            res.sendStatus(500);
        }
    }
});

router.get("/group", [], async (req: Request, res: Response) => {
    var { group_id, offset, limit, platform } = req.query;
    const username = req.session.username;
    const eventRepository = new EventRepository();
    try {
        if (!username) {
            throw new UserNameNotFoundError("", "");
        }

        // userId has to be not null to get to this protected endpoint
        const userId = req.session.userId!!;

        offset = offset as string;
        limit = limit as string;
        group_id = group_id as string;
        platform = platform as string | undefined;

        const result = await eventRepository
            .getEventsForGroup(userId, parseInt(group_id), parseInt(offset), parseInt(limit), platform ? parseInt(platform) : undefined);

        res.json(result);
    } catch (e) {
        if (e instanceof UserNameNotFoundError) {
            res.status(404).send("User not found");
        }
        else {
            console.error(e);
            res.sendStatus(500);
        }
    }
});

router.post("/like", async (req: Request, res: Response) => {
    try {
      const { event_id } = req.body;
      const user_id = req.session.userId!!;
      const result = await new EventRepository().toggleLike(user_id, event_id);
  
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

////TESTING ONLY
router.get("/testUpdateRankings", async (req: Request, res: Response) => {
    try {
      await new UpdateRankingsJob().run();
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
module.exports = router;