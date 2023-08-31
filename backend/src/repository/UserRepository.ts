import { pool } from "../db/db";
import { User } from "../model/schemas/userSchema";


export class UserRepository {
  async saveUser(mongoId: string, username: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertUser = await client.query(
        "INSERT INTO users (mongo_id, username) VALUES ($1, $2) RETURNING id",
        [mongoId, username]
      );
      console.log("Inserted user with id", insertUser.rows[0].id);
      await client.query('COMMIT');
      return insertUser.rows[0].id;
    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to insert user into PostgreSQL database:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getUser(username: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const userInfo = await client.query(`SELECT * FROM users WHERE username = $1`, [username]);

      await client.query('COMMIT');
      
      return userInfo.rows[0];

    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to get user info from PostgreSQL database:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getAllUsernames() : Promise<any[]>  {
    const query = `SELECT username from users;`;

    try {
      const result = await pool.query(query);

      return result.rows;
    } catch(e) {
      console.error('Failed to query postgres db for usernames');
    }

    return [];
  }

  async getAllMongoIds() {
    const query = `SELECT mongo_id from users;`;

    try {
      const result = await pool.query(query);

      return result.rows.map(r => r.mongo_id);
    } catch(e) {
      console.error('Failed to query postgres db for usernames');
    }
    return [];
  }

  async recomputeRanksForAllUsers() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
  
      // Update previous-rank with current_rank
      await client.query("UPDATE users SET previous_rank = current_rank;");
  
      // Update current-rank based on score field in psql and it doest bring the rank in the nodejs
      await client.query(`
            WITH ranked_users AS (
                SELECT id, ROW_NUMBER() OVER(ORDER BY score DESC) as rank
                FROM users
            )
            UPDATE users
            SET current_rank = ranked_users.rank
            FROM ranked_users
            WHERE users.id = ranked_users.id;
        `);
  
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Failed to update ranks:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async updateUserScore(mongoId: string, newScore: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
  
      const updateScoreQuery = `
          UPDATE users
          SET score = $1
          WHERE mongo_id = $2
        `;
      await client.query(updateScoreQuery, [newScore, mongoId]);
  
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Failed to update score:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async updateUsername(userId: number, username: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
  
      const updateUserQuery = `
          UPDATE users
          SET username = $2
          WHERE id = $1
        `;
      await client.query(updateUserQuery, [userId, username]);
  
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Failed to update user:", e);
      throw e;
    } finally {
      client.release();
    }
  }

   async calculateNewScoreForUser(mongoId: string) {
    console.log(`Updating score for user ${mongoId}`);
    const user = await User.findById(mongoId, { password: 0 });
    let leetcodeCount = 0;
    if (
      user?.leetcode?.submitStats?.acSubmissionNum[0]?.count != undefined
    ) {
      leetcodeCount = user.leetcode.submitStats.acSubmissionNum[0].count;
    }

    let vjudgeCount = 0;
    if (user?.vjudge?.acRecords) {
      for (const platform in user.vjudge.acRecords) {
        const platformKey = platform as keyof typeof user.vjudge.acRecords;
        if (Array.isArray(user.vjudge.acRecords[platformKey])) {
          vjudgeCount += user.vjudge.acRecords[platformKey].length;
        }
      }
    }

    return leetcodeCount + vjudgeCount;
  } 
}

export const userRepository = new UserRepository();
