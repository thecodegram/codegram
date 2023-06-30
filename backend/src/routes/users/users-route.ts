import express, { Request, Response } from 'express'

import { validateUsername, handleValidationErrors } from '../../utils/middleware'
import { getUserIDs, addUserID } from '../../model/users';

const router = express.Router()

router.post('/:userId', [
  // Sanitize the userId variable
  validateUsername('userId'),
  handleValidationErrors
], (req: Request, res: Response) => {
  const { userId } = req.params;
  const userIDs = getUserIDs();

  if (userIDs.has(userId)) {
    res.status(201).send("Already exists")
    return
  }

  addUserID(userId)
  res.sendStatus(200)
})

module.exports = router;