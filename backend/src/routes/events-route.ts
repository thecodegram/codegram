import express, { Request, Response } from "express";
import { EventRepository } from "../repository/EventRepository";
import { UserRepository } from "../repository/UserRepository";
import { UserNameNotFoundError } from "../errors/username-not-found-error";

const router = express.Router();

router.get("/", [], async (req: Request, res: Response) => {
    const { username, platform, offset, limit } = req.body;
    const eventRepository = new EventRepository();
    const userRepository = new UserRepository();
    try {
        const user = await userRepository.getUser(username);

        if (!user) {
            throw new UserNameNotFoundError(username, "codegram");
        }
        const result = await eventRepository.getEventsForOneUser(user.id, offset, limit, platform);

        res.json(result);
    } catch (e) {
        if (e instanceof UserNameNotFoundError) {
            res.status(404).send("User not found");
        }
    }
});

router.get("/feed", [], async (req: Request, res: Response) => {
    const { offset, limit } = req.body;
    const username = req.session.username;
    const eventRepository = new EventRepository();
    const userRepository = new UserRepository();
    try {
        if(!username) {
            throw new UserNameNotFoundError("", "");
        }
        const user = await userRepository.getUser(username);

        if (!user) {
            throw new UserNameNotFoundError(username, "codegram");
        }
        const result = await eventRepository.getEventsVisibleToUser(user.id, offset, limit);

        res.json(result);
    } catch (e) {
        if (e instanceof UserNameNotFoundError) {
            res.status(404).send("User not found");
        }
    }
});

router.get("/group", [], async (req: Request, res: Response) => {
    const { group_id, offset, limit } = req.body;
    const username = req.session.username;
    const eventRepository = new EventRepository();
    const userRepository = new UserRepository();
    try {
        if(!username) {
            throw new UserNameNotFoundError("", "");
        }
        const user = await userRepository.getUser(username);

        if (!user) {
            throw new UserNameNotFoundError(username, "codegram");
        }
        const result = await eventRepository.getEventsForGroup(user.id, group_id, offset, limit);

        res.json(result);
    } catch (e) {
        if (e instanceof UserNameNotFoundError) {
            res.status(404).send("User not found");
        }
    }
});

module.exports = router;