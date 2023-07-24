import express, { Request, Response } from "express";

const router = express.Router();

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


module.exports = router;