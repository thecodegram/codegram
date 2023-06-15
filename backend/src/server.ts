import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { CronJob } from 'cron';
import { param, validationResult } from 'express-validator'

// Create an Express.js app
const app = express();
const port = 8080;

// Define the list of user IDs
const userIds = new Set<string>();
const allowedUsername: RegExp = /^[a-zA-Z0-9_-]+$/

const handleValidationErrors = (
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
// Function to make GraphQL requests for a specific user ID
async function makeGraphQLRequest(userId: String) {
  try {
    // Make the GraphQL request
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `
      { 
        matchedUser(username: "${userId}") 
        {
            username
            submitStats: submitStatsGlobal 
            {
                acSubmissionNum 
                {
                    difficulty
                    count
                    submissions
                }
            }
        }
    }
      `
    });

    // Handle the response
    console.log(`User ID: ${userId}`);
    console.log(JSON.stringify(response.data.data.matchedUser));
    return response.data.data.matchedUser;
  } catch (error) {
    console.error(`Error fetching data for user ID ${userId}:`, error);
  }
}

// Set up the cron job to run every 2 minutes
const job = new CronJob('*/2 * * * *', () => {
  for (const userId of userIds) {
    makeGraphQLRequest(userId);
  }
});
// job.start();

// Add userId to tracking
app.post('/api/addUser/:userId', [
  // Sanitize the userId variable
  param('userId').escape().matches(allowedUsername),
  handleValidationErrors
], (req: Request, res: Response) => {
  const { userId } = req.params;

  if (userIds.has(userId)) {
    res.status(201).send("Already exists")
    return
  }

  userIds.add(userId)
  res.sendStatus(200)
})

// Define an endpoint to trigger the GraphQL requests manually
app.get('/api/trigger-requests/', async (req: Request, res: Response) => {
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
app.get('/api/trigger-requests/:userId', [
  // Sanitize the userId variable
  param('userId').escape().matches(allowedUsername),
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { userId } = req.params;


  const data = await makeGraphQLRequest(userId);
  console.log("data:", data);

  res.send(data);
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Navigate to http://localhost:${port}/`)
});
