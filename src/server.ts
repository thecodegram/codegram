import { json } from "express";

const express = require('express');
const axios = require('axios');
const { CronJob } = require('cron');

// Create an Express.js app
const app = express();
const port = 3000;

// Define the list of user IDs
const userIds: any[] = []; 

// Function to make GraphQL requests for a specific user ID
async function makeGraphQLRequest(userId: any) {
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
// const job = new CronJob('*/2 * * * *', () => {
//   for (const userId of userIds) {
//     makeGraphQLRequest(userId);
//   }
// });
// job.start();

// Define an endpoint to trigger the GraphQL requests manually
app.get('/trigger-requests/:userId', async (req: any, res: any ) => {
  const { userId } = req.params;
  userIds.push(userId);
  // makeGraphQLRequest(userId);
  // res.send(`GraphQL request triggered for User ID: ${userId}`);
  // console.log(makeGraphQLRequest(userId));
  const data = await makeGraphQLRequest(userId);
  res.send(data);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
