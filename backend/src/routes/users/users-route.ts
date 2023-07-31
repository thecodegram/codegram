import express, { Request, Response } from "express";

import {
  validateUsername,
  handleValidationErrors,
} from "../../utils/middleware";
import { getUserIDs, addUserID } from "../../model/users";
import { User } from "../../model/schemas/userSchema";
import { UserNameNotFoundError } from "../../errors/username-not-found-error";
import { getSubmissionStats } from "../../api/vjudge";
import { getLatestAcceptedSubmits, getSubmitStats } from "../../api/leetcode";
import { uploadFile, getFile } from "../../repository/ImageBucket";
import {
  NotificationRepository,
  NotificationTypes,
} from "../../repository/NotificationRepository";
import { FriendRepository } from "../../repository/FriendRepository";
import { UserRepository } from "../../repository/UserRepository";
import sanitize from "sanitize-filename";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();
const friendRepository = new FriendRepository();

router.get(
  "/:username/latestSubmits",
  [
    // Sanitize the userId variable
    validateUsername("username"),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    const { username } = req.params;

    const userData = await User.findOne(
      { username: username },
      {
        password: false,
        "leetcode._id": false,
        vjudge: false,
      }
    );

    if (!userData?.leetcode?.username) {
      res.status(404).send("Leetcode username not found");
    } else {
      const leetcodeUsername = userData.leetcode.username;
      const submitStats = await getLatestAcceptedSubmits(leetcodeUsername);

      if (!submitStats) {
        res.status(404).send("User not found on leetcode");
      } else {
        res.status(200).json(submitStats);
      }
    }
  }
);

router.post(
  "/:userId",
  [
    // Sanitize the userId variable
    validateUsername("userId"),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    const data = req.body;

    const { userId } = req.params;
    const userIDs = getUserIDs();

    if (userIDs.has(userId)) {
      res.status(201).send("Already exists");
      return;
    }

    addUserID(userId);
    res.sendStatus(200);
  }
);

router.put(
  "/:username",
  upload.single("image"),
  [
    // Sanitize the userId variable
    validateUsername("username"),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const sessionUsername = req.session.username;

    // need to be logged in as that user to mmodify it
    if (username != sessionUsername) {
      res.status(403).send("Forbidden");
    } else {
      const data = req.body;
      console.log("this is vjudge username " + data.vjudgeUsername);
      console.log("this is leetcode username " + data.leetcodeUsername);
      if (!data) {
        res.sendStatus(400);
      } else {
        // find the entry in the db for this user
        const user = await User.findOne(
          { username: username },
          {
            password: false,
          }
        );

        if (!user) {
          res.status(500).send("Authorized user was not found in the db");
        } else {
          try {
            if (req.file) {
              const filePath = req.file.path;
              const sanitizedOriginalName = sanitize(req.file.originalname);
              const fileName = `profile_pics/${username}/${sanitizedOriginalName}`;
              // Upload the file to GCS
              await uploadFile(fileName, filePath);
              // Store the file name in the user document
              user.profilePic = fileName;
              try {
                fs.unlinkSync(filePath);
              } catch (err) {
                console.error("Failed to delete the file of fs: ", err);
              }
            }

            // if update request has a new vjudge name
            // ensure this is a valid name
            // update the vjudge username and latest data
            const updateVjudge = (async () => {
              const existingUser = await User.findOne({
                "vjudge.username": data.vjudgeUsername,
              });
              if (existingUser) {
                throw new Error(
                  "VJudge username is already in use by another user"
                );
              }

              if (data.vjudgeUsername) {
                const vjudgeStats = await getSubmissionStats(
                  data.vjudgeUsername
                );
                // console.log(vjudgeStats);
                vjudgeStats.username = data.vjudgeUsername;
                user.vjudge = vjudgeStats;
              }
            })();
            // if update request has a new vjudge name
            // ensure this is a valid name
            // update the vjudge username and latest data
            const updateLeetcode = (async () => {
              const existingUser = await User.findOne({
                "leetcode.username": data.leetcodeUsername,
              });
              if (existingUser) {
                throw new Error(
                  "Leetcode username is already in use by another user"
                );
              }

              // console.log(data.leetcodeUsername);
              if (data.leetcodeUsername) {
                const leetcodeStats = await getSubmitStats(
                  data.leetcodeUsername
                );
                console.log("this is LC data: " + leetcodeStats);
                user.leetcode = leetcodeStats;
              }
            })();

            // update in parallel
            // await updateVjudge;
            // await updateLeetcode;
            await Promise.all([updateVjudge, updateLeetcode]);
            await user.save();

            res.sendStatus(200);
          } catch (err) {
            if (err instanceof UserNameNotFoundError) {
              res.status(404).send(err.message);
            } else if (err instanceof Error) {
              console.error(err);
              res.status(500).send(`${err.message}`);
            } else {
              // err is something unexpected (not an Error instance)
              console.error(err);
              res.status(500).send("An unexpected error occurred");
            }
          }
        }
      }
    }
  }
);

router.get(
  "/:username",
  [
    // Sanitize the userId variable
    validateUsername("username"),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    const { username } = req.params;

    const userPostgresData = await userRepository.getUser(username);

    const userMongoData = await User.findOne(
      { username: username },
      {
        password: false,
        "leetcode._id": false,
        "leetcode.submitStats._id": false,
        "leetcode.submitStats.acSubmissionNum._id": false,
      }
    );

    if (!userMongoData || !userPostgresData) {
      res.status(404).send("User not found");
    } else {
      res
        .status(200)
        .json({ mongo: userMongoData, postgres: { id: userPostgresData.id } });
    }
  }
);

router.get(
  "/:username/profilePicture",
  [validateUsername("username"), handleValidationErrors],
  async (req: Request, res: Response) => {
    const { username } = req.params;

    const userData = await User.findOne(
      { username: username },
      {
        username: true,
        profilePic: true,
        _id: false,
      }
    );

    if (!userData) {
      res.status(404).send("User not found");
    } else {
      if (userData.profilePic) {
        const readStream = await getFile(userData.profilePic);

        // we might need to adjust this depending on your image format
        res.setHeader("Content-Type", "image/jpeg");

        readStream.pipe(res);
      } else {
        res.status(204).end();
      }
    }
  }
);

router.get(
  "/:userId/notifications",
  [
    // Sanitize the userId variable
    validateUsername("userId"),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const notifications = await notificationRepository.getNotifications(
        userId
      );
      res.status(200).json(notifications);
    } catch (err) {
      res.status(500).send("Failed to get user's notifications");
    }
  }
);

router.post(
  "/:userId/notifications",
  [
    // Sanitize the userId variable
    validateUsername("userId"),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { message, type } = req.body;

    try {
      const newNotification = await notificationRepository.createNotification(
        +userId,
        message,
        type
      );
      res.status(200).json(newNotification);
    } catch (err) {
      res.status(500).send("Failed to create a new notification");
    }
  }
);

router.get(
  "/:userId/friend-requests",
  [validateUsername("userId"), handleValidationErrors],
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const friendRequests = await friendRepository.getFriendRequests(+userId);
      res.status(200).json(friendRequests);
    } catch (err) {
      res.status(500).send("Failed to get user's friend requests");
    }
  }
);

router.post(
  "/:userId/send-friend-request/:requesteeId",
  [validateUsername("userId"), handleValidationErrors],
  async (req: Request, res: Response) => {
    const { userId: requesterId, requesteeId } = req.params;
    const requesterUsername = req.session.username;

    try {
      const newFriendRequest = await friendRepository.createFriendRequest(
        +requesterId,
        +requesteeId
      );
      await notificationRepository.createNotification(
        +requesteeId,
        `@${requesterUsername} sent you a friend request!`,
        NotificationTypes.friend
      );

      res.status(200).json(newFriendRequest);
    } catch (err) {
      res.status(500).send("Failed to send friend request");
    }
  }
);

router.post(
  "/:userId/friend-requests/:friendRequestId/accept",
  [validateUsername("userId"), handleValidationErrors],
  async (req: Request, res: Response) => {
    const { userId: requesteeId, friendRequestId } = req.params;
    const { requesterId } = req.body;

    try {
      const newFriend = await friendRepository.createFriend(
        +requesterId,
        +requesteeId
      );
      await friendRepository.deactivateFriendRequest(+friendRequestId);
      res.status(200).json(newFriend);
    } catch (err) {
      res.status(500).send("Failed to accept friend request");
    }
  }
);

router.post(
  "/:userId/friend-requests/:friendRequestId/remove",
  [validateUsername("userId"), handleValidationErrors],
  async (req: Request, res: Response) => {
    const { friendRequestId } = req.params;

    try {
      const newFriendRequest = await friendRepository.deactivateFriendRequest(
        +friendRequestId
      );
      res.status(200).json(newFriendRequest);
    } catch (err) {
      res.status(500).send("Failed to remove friend request");
    }
  }
);

router.get(
  "/:userId/friends",
  [validateUsername("userId"), handleValidationErrors],
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const newFriendRequest = await friendRepository.getFriends(+userId);
      res.status(200).json(newFriendRequest);
    } catch (err) {
      res.status(500).send("Failed to get user's friends");
    }
  }
);

module.exports = router;
