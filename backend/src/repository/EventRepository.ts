import { pool } from "../db/db";
import { UpdateEventData } from "../model/UpdateEventData";

export class EventRepository {
  async saveEvent(updateData: UpdateEventData) {
    console.log("Save event", updateData);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      
      const {
        username,
        platform,
        problemTitle,
        problemTitleSlug,
        timestamp,
      } = updateData;
      
      const userRes = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );
      const userId = userRes.rows[0]?.id;

      const platformRes = await client.query(
        "SELECT pid FROM platform WHERE pname = $1",
        [platform]
      );
      const platformId = platformRes.rows[0]?.pid;

      if (!userId || !platformId) {
        throw new Error(
          `Failed to find userId for username ${username} or platformId for platform ${platform}`
        );
      }
      console.log("userId:", userId);
      console.log("platformId:", platformId);
      const insertRes = await client.query(
        "INSERT INTO events (pid, user_id, problem_name, problem_slug, event_timestamp) VALUES ($1, $2, $3, $4, TO_TIMESTAMP($5/1000)) RETURNING id",
        [platformId, userId, problemTitle, problemTitleSlug, timestamp]
      );
      console.log("Inserted event with id", insertRes.rows[0].id);

      await client.query("COMMIT"); 
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Failed to insert event into database:", e);
    } finally {
      client.release();
    }
  }


}
