import express, { Request, Response } from "express";
import { EventRepository } from "../repository/EventRepository";
import { UserRepository } from "../repository/UserRepository";
import { UserNameNotFoundError } from "../errors/username-not-found-error";

const router = express.Router();

router.get("/", [], async (req: Request, res: Response) => {
    var { username, platform, offset, limit } = req.query;
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
                .getEventsForOneUser(user.id, parseInt(offset), parseInt(limit), platform ? parseInt(platform) : undefined);

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
    const userRepository = new UserRepository();
    try {
        if (!username) {
            throw new UserNameNotFoundError("", "");
        }
        offset = offset as string;
        limit = limit as string;
        const user = await userRepository.getUser(username);

        if (!user) {
            throw new UserNameNotFoundError(username, "codegram");
        }
        const result = await eventRepository
            .getEventsVisibleToUser(user.id, parseInt(offset), parseInt(limit));

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
    const userRepository = new UserRepository();
    try {
        if (!username) {
            throw new UserNameNotFoundError("", "");
        }
        const user = await userRepository.getUser(username);

        if (!user) {
            throw new UserNameNotFoundError(username, "codegram");
        }

        offset = offset as string;
        limit = limit as string;
        group_id = group_id as string;
        platform = platform as string | undefined;

        const result = await eventRepository
            .getEventsForGroup(user.id, parseInt(group_id), parseInt(offset), parseInt(limit), platform ? parseInt(platform) : undefined);

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

module.exports = router;