import axios from 'axios';
import { isValidUsername } from '../utils/utils';

// Function to make GraphQL requests for a specific user ID
export async function getSubmitStats(userId: string) {
  console.log(userId);
    if(!isValidUsername(userId)) {
      console.log("invalid username")
      return;
    }
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

export async function getLatestSubmits(userId: string) {
  if(!isValidUsername(userId)) return;
  try {
    // Make the GraphQL request
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `
      {     
        recentSubmissionList(username: "${userId}") {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
          __typename
          }
      }
      `
    });
    return response.data.data.recentSubmissionList;
  } catch (error) {
    console.error(`Error fetching data for user ID ${userId}:`, error);
  }
}