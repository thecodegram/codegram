export interface LeetcodeData {
    username?: string;
    leetcode: {
      submitStats?: {
        acSubmissionNum: {
          difficulty: string;
          count: number;
          submissions: number;
        }[];
      };
    };
  }