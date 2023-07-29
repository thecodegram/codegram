import { pool } from "../db/db";
import { User } from "../model/schemas/userSchema";

async function calculateNewScoreForUser(user: any) {
  let leetcodeCount = 0;
  if (
    user.leetcode &&
    user.leetcode.submitStats &&
    user.leetcode.submitStats.acSubmissionNum
  ) {
    leetcodeCount = user.leetcode.submitStats.acSubmissionNum[0].count;
  }

  let vjudgeCount = 0;
  if (user.vjudge && user.vjudge.acRecords) {
    for (const platform in user.vjudge.acRecords) {
      if (Array.isArray(user.vjudge.acRecords[platform])) {
        vjudgeCount += user.vjudge.acRecords[platform].length;
      }
    }
  }

  return leetcodeCount + vjudgeCount;
}

async function updateScoreInPostgres(mongoId: string, newScore: number) {
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

async function updateAllUserScores() {
  const users = await User.find();

  for (const user of users) {
    const newScore = await calculateNewScoreForUser(user);
    await updateScoreInPostgres(user._id.toString(), newScore);
  }
}

async function recomputeRanksForAllUsers() {
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

async function updateRankingsJob() {
  await updateAllUserScores();
  await recomputeRanksForAllUsers();
}

export default updateRankingsJob;
