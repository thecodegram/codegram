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
      } = updateData;;
      
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
      const insertRes = await client.query(
        "INSERT INTO events (pid, user_id, problem_name, problem_slug, event_timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [platformId, userId, problemTitle, problemTitleSlug, new Date(timestamp).toISOString()]
      );
      console.log(`timestamp: ${new Date(timestamp).toISOString()}`)
      console.log("Inserted event with id", insertRes.rows[0].id);

      await client.query("COMMIT"); 
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Failed to insert event into database:", e);
    } finally {
      client.release();
    }
  }

  async getEventsForOneUser(id: number, offset: number, limit: number, platform?: number) {
    var query = `
      WITH likes_count(event_id, likes) AS (
        SELECT e.id, count(l.user_id)
        FROM events e LEFT JOIN likes l ON e.id = l.event_id
        WHERE e.user_id = $1
        GROUP BY e.id
      ),
      SELECT e.id, p.pname, u.username, e.problem_name, e.problem_slug, e.event_timestamp
       FROM events e 
        JOIN users u ON e.user_id = u.id
        JOIN platform p ON e.pid = p.pid
        JOIN likes_count lc ON e.id = lc.event_id
       WHERE u.id = $1 `;
        
       if(platform != undefined) {
        query += `AND p.pid = $4 `;
       }
       query += `
        ORDER BY e.event_timestamp DESC
        OFFSET $2 ROWS
        FETCH NEXT $3 ROWS ONLY;
      `

    try {
      const results = await pool.query(query, [id, offset, limit, platform??0]);

      return results.rows;
    } catch(e) {
      console.error(e);
    }
  }

  async getEventsForGroup(group_id: number, offset: number, limit: number, platform?: number) {
    var query = `
      WITH likes_count(event_id, likes) AS (
        SELECT e.id, count(l.user_id)
        FROM events e LEFT JOIN likes l ON e.id = l.event_id
        WHERE e.user_id = $1
        GROUP BY e.id
      ),
      group_member_ids(id) AS (
        SELECT user_id
        FROM user_group
        WHERE group_id = $1
      )
      SELECT e.id, p.pname, u.username, e.problem_name, e.problem_slug, e.event_timestamp
       FROM events e 
        JOIN users u ON e.user_id = u.id
        JOIN platform p ON e.pid = p.pid
        JOIN likes_count lc ON e.id = lc.event_id
       WHERE u.id IN (SELECT * FROM group_member_ids)`;
        
       if(platform != undefined) {
        query += `AND p.pid = $4 `;
       }
       query += `
        ORDER BY e.event_timestamp DESC
        OFFSET $2 ROWS
        FETCH NEXT $3 ROWS ONLY;
      `

    try {
      const results = await pool.query(query, [group_id, offset, limit, platform??0]);

      return results.rows;
    } catch(e) {
      console.error(e);
    }
  }

  async getEventsVisibleToUser(id: number, offset: number, limit: number) {
    const query = `
    WITH likes_count(event_id, likes) AS (
      SELECT e.id, count(l.user_id)
      FROM events e LEFT JOIN likes l ON e.id = l.event_id
      WHERE e.user_id = $1
      GROUP BY e.id
    ),
    group_member_ids(id) AS (
      SELECT DISTINCT other.user_id
      FROM user_group current
        JOIN user_group other ON current.group_id = other.group_id
      WHERE current.user_id = $1
    ),
    friend_ids(id) AS (
      (
        SELECT user_2_id
        FROM friend f
        WHERE f.user_1_id = $1
      )
      UNION
      (
        SELECT user_1_id
        FROM friend f
        WHERE f.user_2_id = $1
      )
    )
    SELECT
      e.id event_id, e.user_id user_id, p.pname platform, u.username, e.problem_name, e.problem_slug, e.event_timestamp, lc.likes
    FROM events e 
      JOIN users u ON e.user_id = u.id
      JOIN platform p ON e.pid = p.pid
      JOIN likes_count lc ON e.id = lc.event_id
    WHERE 
      u.id = 1 
      OR u.id IN (SELECT * FROM group_member_ids)
      OR u.id IN (SELECT * FROM friend_ids)
    ORDER BY e.event_timestamp DESC
    OFFSET $2 ROWS
    FETCH NEXT $3 ROWS ONLY;`;

      try {
        const results = await pool.query(query, [id, offset, limit]);
  
        return results.rows.map(r => {
          r.event_timestamp = new Date(r.event_timestamp).getTime();
          return r;
        });
      } catch(e) {
        throw(e);
      }
  }
}
