import { Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator'
import { validUsername } from './utils';



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