import express, { Request, Response } from 'express'

import { validateUsername, handleValidationErrors } from '../../utils/middleware'
import { getUserIDs, addUserID } from '../../model/users';
import { User } from '../../model/schemas/userSchema';
import { UserNameNotFoundError } from '../../errors/username-not-found-error';
import { getSubmissionStats } from '../../api/vjudge';
import { getLatestSubmits, getSubmitStats } from '../../api/leetcode';

const router = express.Router()

router.get('/:username/latestSubmits', [
  // Sanitize the userId variable
  validateUsername('username'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { username } = req.params;

  const userData = await User.findOne(
    {username: username},
    {
      password: false,
      'leetcode._id':false,
      vjudge: false
    });
  
  if(!userData?.username){
     res.status(404).send("User not found");
  } else {

    const leetcodeUsername = userData.username;
    const submitStats = await getLatestSubmits(leetcodeUsername);
  
    if(!submitStats){
      res.status(404).send("User not found on leetcode");
    }
    else {
      res.status(200).json(submitStats);
    }

  }
});

router.post('/:userId', [
  // Sanitize the userId variable
  validateUsername('userId'),
  handleValidationErrors
], (req: Request, res: Response) => {
  const data = req.body;
  
  const { userId } = req.params;
  const userIDs = getUserIDs();

  if (userIDs.has(userId)) {
    res.status(201).send("Already exists")
    return
  }

  addUserID(userId)
  res.sendStatus(200)
})

router.put('/:username', [
  // Sanitize the userId variable
  validateUsername('username'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const {username} = req.params;
  
  const sessionUsername = req.session.username;

  // need to be logged in as that user to mmodify it
  if(username != sessionUsername){
    res.status(403).send("Forbidden");
  } else {
    const data = req.body;

    if(!data) {
      res.send(400);
    }
    else {
      // find the entry in the db for this user
      const user = await User.findOne(
        {username: username},
        {
          password: false
        });
      
      if(!user) {
        res.status(500).send('Authorized user was not found in the db')
      } else {
        try {
          // if update request has a new vjudge name
          // ensure this is a valid name
          // update the vjudge username and latest data
          const updateVjudge = (async () => {
            if(data.vjudgeUsername) {
                const vjudgeStats = await getSubmissionStats(data.vjudgeUsername);
                console.log(vjudgeStats);
                vjudgeStats.username = data.vjudgeUsername;
                user.vjudge = vjudgeStats;
            }
          })();
          // if update request has a new vjudge name
          // ensure this is a valid name
          // update the vjudge username and latest data
          const updateLeetcode = (async() => {if(data.leetcodeUsername) {
            const leetcodeStats = await getSubmitStats(data.leetcodeUsername);
            user.leetcode = leetcodeStats;
          }})();
          
          // update in parallel
          await updateVjudge;
          await updateLeetcode;

          await user.save();

          res.sendStatus(200);
        } catch(err) {
          if(err instanceof UserNameNotFoundError){
            res.status(404).send(err.message);
          }
          else {
            console.error(err);
            res.status(500).send("Something went wrong");
          }
        }
      }
    }
  }
})

router.get('/:username', [
  // Sanitize the userId variable
  validateUsername('username'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { username } = req.params;
  
  const userData = await User.findOne(
    {username: username},
    {
      password: false,
      'leetcode._id':false,
      'leetcode.submitStats._id':false,
      'leetcode.submitStats.acSubmissionNum._id':false
    });

  if(!userData){
    res.status(404).send("User not found");
  }
  else {
    res.status(200).json(userData);
  }
})



module.exports = router;