import axios from "axios";
import { isValidUsername } from "../utils/utils";


export class LeetCodeApi {
  // Function to make GraphQL requests for a specific user ID
  async getSubmitStats(userId: string) {
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

      if (response.data.data.matchedUser === null) {
        throw new Error(`Leetcode username ${userId} was not found`);
      }

      return response.data.data.matchedUser;
    } catch (error) {
      console.error(`Error fetching data for user ID ${userId}:`, error);
      throw error;
    }
  }

  async getLatestAcceptedSubmits(
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
}

export const leetcodeApi = new LeetCodeApi();
