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
import { NotificationRepository } from "../../repository/NotificationRepository";
import { FriendRepository } from "../../repository/FriendRepository";
import sanitize from "sanitize-filename";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "uploads/" });
const router = express.Router();
const notificationRepository = new NotificationRepository()
const friendRepository = new FriendRepository()

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
      console.log("this is body" + data.vjudgeUsername);
      if (!data) {
        res.send(400);
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
              console.log(data.leetcodeUsername);
              if (data.leetcodeUsername) {
                const leetcodeStats = await getSubmitStats(
                  data.leetcodeUsername
                );
                console.log(leetcodeStats);
                user.leetcode = leetcodeStats;
              }
            })();

            // update in parallel
            await updateVjudge;
            await updateLeetcode;

            await user.save();

            res.sendStatus(200);
          } catch (err) {
            if (err instanceof UserNameNotFoundError) {
              res.status(404).send(err.message);
            } else {
              console.error(err);
              res.status(500).send("Something went wrong");
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

    const userData = await User.findOne(
      { username: username },
      {
        password: false,
        "leetcode._id": false,
        "leetcode.submitStats._id": false,
        "leetcode.submitStats.acSubmissionNum._id": false,
      }
    );

    if (!userData) {
      res.status(404).send("User not found");
    } else {
      res.status(200).json(userData);
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

    console.log(userData);

    if (!userData) {
      res.status(404).send("User not found");
    } else {
      if (userData.profilePic) {
        const readStream = await getFile(userData.profilePic);

        // we might need to adjust this depending on your image format
        res.setHeader("Content-Type", "image/jpeg");

        readStream.pipe(res);
      } else {
        res.status(404).send("Profile picture not found");
      }
    }
  }
);

router.get('/:userId/notifications', [
  // Sanitize the userId variable
  validateUsername('userId'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    const notifications = await notificationRepository.getNotifications(userId)
    res.status(200).json(notifications)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/:userId/notifications', [
  // Sanitize the userId variable
  validateUsername('userId'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { userId } = req.params
  const { message, type } = req.body

  try {
    const newNotification = await notificationRepository.createNotification(+userId, message, type)
    res.status(200).json(newNotification)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/:userId/friend-requests', [
  validateUsername('userId'),
  handleValidationErrors
],async (req: Request, res: Response) => {
  const { userId } = req.params

  try {
    const friendRequests = await friendRepository.getFriendRequests(+userId)
    res.status(200).json(friendRequests)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/:userId/friend-requests/:requesteeId', [
  validateUsername('userId'),
  handleValidationErrors
],async (req: Request, res: Response) => {
  const { userId: requesterId, requesteeId } = req.params

  try {
    const newFriendRequest = await friendRepository.createFriendRequest(+requesterId, +requesteeId)
    res.status(200).json(newFriendRequest)
  } catch (err) {
    res.status(500).send(err)
  }
})


module.exports = router;
