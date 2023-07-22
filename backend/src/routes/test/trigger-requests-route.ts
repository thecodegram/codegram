import express, { Request, Response} from 'express'

import { getLatestAcceptedSubmits, getSubmitStats } from '../../api/leetcode'
import { validateUsername, handleValidationErrors } from '../../utils/middleware'
import { getUserIDs } from '../../model/users';
import { getSubmissionStats } from '../../api/vjudge';
import { UserNameNotFoundError } from '../../errors/username-not-found-error';
import { ExternalApiError } from '../../errors/external-api-error';
import { User } from '../../model/schemas/userSchema';
import { userUpdateEventEmitter } from '../../events/UserUpdateEventEmitter';
import { UpdateEventData } from '../../repository/EventRepository';
import { getLeetcodeUpdates, getUpdates } from '../../services/UpdatesCollectorService';

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const userIds = getUserIDs();
    const promises: Promise<ReturnType<typeof getSubmitStats>>[] = Array.from(userIds).map(async (id) => {
      const cur = await getSubmitStats(id);
      console.log("cur:", cur);
      return cur;
    });

    const data = await Promise.all(promises);
    console.log(data);

    res.send(data);
  } catch(e: any) {
      console.log(e);
      res.status(500).end();
  }
});

// trigger for specific user
router.get('/leetcode/:userId', [
    // Sanitize the userId variable
    validateUsername('userId'),
    handleValidationErrors
  ], async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const data = await getSubmitStats(userId);
    console.log("data:", data);
  
    res.send(data);
  });

// trigger for specific user
router.get('/vjudge/:username', [
  // Sanitize the userId variable
  validateUsername('username'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { username } = req.params;
  
  try {
    const data = await getSubmissionStats(username);
    console.log("data:", data);

    res.send(data);
  } catch(e) {
    if(e instanceof UserNameNotFoundError){
      res.status(404).send("Username not found");
    } else if( e instanceof ExternalApiError) {
      res.status(e.statusCode).send(e.message)
    } else{
      console.error(e);
    }
  }
});

router.get('/updatesList/:username', [
  // Sanitize the userId variable
  validateUsername('username'),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const {username} = req.params;

  if(!username) {
    res.status(400).send();
  }
  else {
    try {
      const updates = await getUpdates(username);

      res.json(updates).send();
    }
    catch(err){
      if(err instanceof UserNameNotFoundError){
        res.status(404).send("user not found");
      }
      else {
        res.status(500).send("Oops! Something went wrong");
      }
    }
  }
});

module.exports = router;