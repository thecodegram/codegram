import express, { Request, Response} from 'express'

import { makeGraphQLRequest } from '../../api/leetcode'
import { validateUsername, handleValidationErrors } from '../../utils/middleware'
import { getUserIDs } from '../../model/users';

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  const userIds = getUserIDs();
  const promises: Promise<ReturnType<typeof makeGraphQLRequest>>[] =
    Array.from(userIds).map(async (id) => {
      const cur = await makeGraphQLRequest(id);
      console.log("cur:", cur);
      return cur;
    });

  const data = await Promise.all(promises);
  console.log(data);

  res.send(data);
});

// trigger for specific user
router.get('/:userId', [
    // Sanitize the userId variable
    validateUsername('userId'),
    handleValidationErrors
  ], async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const data = await makeGraphQLRequest(userId);
    console.log("data:", data);
  
    res.send(data);
  });

module.exports = router;