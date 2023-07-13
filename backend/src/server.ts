import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors'
import session from 'express-session'
import { enforceLoggedIn } from './utils/middleware';
import { setUpDB } from './db/db';
import { corsOptions } from './config/corsConfig';
import { sessionOptions } from './config/sessionConfig';
import { env } from './config/env';

const triggerRequestsRouter = require('./routes/test/trigger-requests-route')
const usersRouter = require('./routes/users/users-route')
const authRouter = require('./routes/auth-route')

// Create an Express.js app
const app = express();
const port = env.PORT || 8080;

// middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(session(sessionOptions));
app.set('trust proxy', 1);

// request logging
app.use('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} for ${req.path}`)
  next();
})

// routing
app.use('/api/trigger-requests', [enforceLoggedIn], triggerRequestsRouter);
app.use('/api/user', [enforceLoggedIn], usersRouter);
app.use('/api/auth', authRouter);

(async () => {
  const isConnectedToDB = await setUpDB();

  if (isConnectedToDB) {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Navigate to http://localhost:${port}/`);
    });
  }
})();
