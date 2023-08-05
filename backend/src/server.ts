import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors'
import session from 'express-session'
import rateLimit from 'express-rate-limit';
import { enforceInternalUser, enforceLoggedIn } from './utils/middleware';
import { pool, setUpDB } from './db/db';
import { corsOptions } from './config/corsConfig';
import { sessionOptions } from './config/sessionConfig';
import { env } from './config/env';
import { Scheduler } from './scheduler/scheduler';
import UpdateRankingsJob from './job/UpdateRankingsJob';

const triggerRequestsRouter = require('./routes/test/trigger-requests-route')
const usersRouter = require('./routes/users-route')
const authRouter = require('./routes/auth-route')
const eventsRouter = require('./routes/events-route')
const groupRouter = require('./routes/groups-route')
const jobsRouter = require('./routes/private/jobs-route')

// Create an Express.js app
const app = express();

// Apply rate limiting middleware to all routes starting with '/api'
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 600, // limit each IP to 600 requests per windowMs
});

const port = env.PORT || 8080;

// middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(session(sessionOptions));
app.set('trust proxy', 1);
app.use('/api', rateLimiter)

// request logging
app.use('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} for ${req.path}`)
  next();
})

// routing
app.use('/api/trigger-requests', [enforceLoggedIn], triggerRequestsRouter);
app.use('/api/user', [enforceLoggedIn], usersRouter);
app.use('/api/group', [enforceLoggedIn], groupRouter);
app.use('/api/events', [enforceLoggedIn], eventsRouter);
app.use('/api/secure/jobs', [enforceInternalUser], jobsRouter);
app.use('/api/auth', authRouter);

const scheduler = new Scheduler();

(async () => {
  const isConnectedToDB = await setUpDB();

  if (isConnectedToDB) {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Navigate to http://localhost:${port}/`);
    });

    // console.log("Starting updates collector scheduler");

    console.log("Running latest codegram 3!");
    // scheduler.start();

    // run ranking job on startup
    // new UpdateRankingsJob().run();
  }
})();

async function shutdown() {
  console.log('Server is shutting down...');
  // scheduler.stop();
  await pool.end();
  console.log("Server was shutdown");
  process.exit(0); // Exit the process gracefully
}

process.on('SIGINT', shutdown); // Capturing SIGINT (Ctrl+C)
process.on('SIGTERM', shutdown); // Capturing SIGTERM (kill command)
process.on('SIGUSR2', shutdown); // Capturing SIGUSR2 - restart from nodemon

process.on('beforeExit', async (code) => {
  // Code to run just before the process exits
  console.log('Process is about to exit with code:', code);

  await shutdown();
});