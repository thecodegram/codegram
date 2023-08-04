import { Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator'
import { validUsername } from './utils';
import { env } from '../config/env';

declare module "express-session" {
  interface SessionData {
      username: string,
      userId: number
  }
}
export const enforceLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if(!req.session.username || !req.session.userId) {
    res.status(401).send("Not authorized!");
    console.log("Not logged in!");
    return;
  }
  
  // Check session expiration
  const currentTime = new Date();
  const cookie = req.session.cookie;
  if (cookie.expires && cookie.expires <= currentTime) {
    console.log("Invalid cookie");
    // The session has expired, so delete the session and treat the request as unauthenticated
    req.session.destroy((err) => {
      console.error(`error destroying session ${err}`);
    });
    return res.status(401).json({ error: 'Session has expired' }).end();
  }
  else {
    next()
  }
}
// Make sure an incoming parameter does not have invalid symbols, propagate error
export const validateUsername = (paramName: string) => param(paramName).escape().matches(validUsername);

// Send Bad Request to client if there were any errors during validation steps
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send("Bad request");
    }
    next();
  };

export const enforceInternalUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const arrivingToken = req.body?.gcloudToken;
  const expectedToken = env.GCLOUD_TOKEN;

  if(arrivingToken !== expectedToken) {
    res.status(403).json({error: "You don't have access to this endpoint"}).end();
  } else {
    next();
  }
}