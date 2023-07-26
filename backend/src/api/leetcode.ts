import axios from "axios";
import { isValidUsername } from "../utils/utils";

// Function to make GraphQL requests for a specific user ID
export async function getSubmitStats(userId: string) {
  console.log(userId);
  if (!isValidUsername(userId)) {
    console.log("invalid username");
    return;
  }
  try {
    // Make the GraphQL request
    const response = await axios.post("https://leetcode.com/graphql", {
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
        `,
    });

    // Handle the response
    console.log(`User ID: ${userId}`);
    console.log(JSON.stringify(response.data.data.matchedUser));

    if (response.data.data.matchedUser === null) {
      throw new Error(`Leetcode username ${userId} was not found`);
    }

    return response.data.data.matchedUser;
  } catch (error) {
    console.error(`Error fetching data for user ID ${userId}:`, error);
    throw error;
  }
}

export async function getLatestAcceptedSubmits(
  userId: string,
  limit: number = 10
) {
  if (!isValidUsername(userId)) return;
  try {
    // Make the GraphQL request
    const response = await axios.post("https://leetcode.com/graphql", {
      query: `
      {     
        recentAcSubmissionList(username: "${userId}", limit: ${limit}) {
          title
          titleSlug
          timestamp
          lang
          }
      }
      `,
    });
    return response.data.data.recentAcSubmissionList;
  } catch (error) {
    console.error(`Error fetching data for user ID ${userId}:`, error);
  }
}
