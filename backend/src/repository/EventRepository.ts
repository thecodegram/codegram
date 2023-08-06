import { pool } from "../db/db";
import { EventModel } from "../model/EventModel";
import { UpdateEventData } from "../model/UpdateEventData";

export class EventRepository {
  private asEventModels = (rows: any[]) => {
    return rows.map(r => {
      const eventModel: EventModel = {
        eventId: r.event_id,
        submitterId: r.submitter_id,
        platform: r.platform,
        username: r.username,
        problemTitle: r.problem_name,
        problemTitleSlug: r.problem_slug,
        timestamp: new Date(r.event_timestamp).getTime(),
        likes: r.like_count,
        likedByCurrentUser: r.liked_by_current_user
      };

      return eventModel;
    });
  }

  async saveEvent(updateData: UpdateEventData) {
    console.log("Save event", updateData);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { username, platform, problemTitle, problemTitleSlug, timestamp } =
        updateData;

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

  async getEventsForOneUser(id: number, currentUserId: number, offset: number, limit: number, platform?: number) {
    const queryParams = [id, currentUserId, offset, limit];
    var query = `
      SELECT
       e.id AS event_id, u.id AS submitter_id, p.pname AS platform, u.username, e.problem_name,
       e.problem_slug, e.event_timestamp, e.like_count, (L.user_id IS NOT NULL) AS liked_by_current_user
       FROM events e 
        JOIN users u ON e.user_id = u.id
        JOIN platform p ON e.pid = p.pid
        LEFT JOIN likes L ON L.event_id = e.id AND L.user_id = $2
       WHERE u.id = $1 `;

    // if platform is specified query from it
    // otherwise query from all
    if (platform != undefined) {
      query += `AND p.pid = $5 `;
      queryParams.push(platform);
    }
    query += `
        ORDER BY e.event_timestamp DESC
        OFFSET $3 ROWS
        FETCH NEXT $4 ROWS ONLY;
      `

    try {
      const results = await pool.query(query, queryParams);

      return this.asEventModels(results.rows);
    } catch (e) {
      console.error(e);
    }
  }

  async getEventsForGroup(
    user_id: number, group_id: number, offset: number, limit: number, platform?: number) {
    const queryParams = [user_id, group_id, offset, limit];
    var query = `
      WITH group_member_ids(id) AS (
        SELECT ug2.user_id
        FROM users u
          JOIN group_member ug1 ON u.id = ug1.user_id
          JOIN group_member ug2 ON ug1.group_id = ug2.group_id
        WHERE u.id = $1 AND ug1.group_id = $2
      )
      SELECT 
        e.id AS event_id, u.id AS submitter_id, p.pname AS platform, u.username,
        e.problem_name, e.problem_slug, e.event_timestamp, e.like_count, (L.user_id IS NOT NULL) AS liked_by_current_user
       FROM events e 
        JOIN users u ON e.user_id = u.id
        JOIN platform p ON e.pid = p.pid
        LEFT JOIN likes L ON L.event_id = e.id AND L.user_id = $1
       WHERE u.id IN (SELECT * FROM group_member_ids)`;

    if (platform != undefined) {
      query += `AND p.pid = $5 `;
      queryParams.push(platform);
    }
    query += `
        ORDER BY e.event_timestamp DESC
        OFFSET $3 ROWS
        FETCH NEXT $4 ROWS ONLY;
      `

    const client = await pool.connect();
    try {
      const results = await client.query(query, queryParams);

      return this.asEventModels(results.rows);
    } catch (e) {
      console.error(e);
    }
  }

  async getEventsVisibleToUser(id: number, offset: number, limit: number) {
    const query = `
      WITH group_member_ids(id) AS (
        SELECT DISTINCT other.user_id
        FROM group_member current
          JOIN group_member other ON current.group_id = other.group_id
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
        e.id AS event_id, u.id AS submitter_id, p.pname platform, u.username, e.problem_name,
        e.problem_slug, e.event_timestamp, e.like_count, (L.user_id IS NOT NULL) AS liked_by_current_user
      FROM events e 
        JOIN users u ON e.user_id = u.id
        JOIN platform p ON e.pid = p.pid
        LEFT JOIN likes L ON L.event_id = e.id AND L.user_id = $1
      WHERE 
        u.id = $1 
        OR u.id IN (SELECT * FROM group_member_ids)
        OR u.id IN (SELECT * FROM friend_ids)
      ORDER BY e.event_timestamp DESC
      OFFSET $2 ROWS
      FETCH NEXT $3 ROWS ONLY;`;

    const client = await pool.connect();
    try {
      const results = await client.query(query, [id, offset, limit]);

      return this.asEventModels(results.rows);
    } catch (e) {
      throw (e);
    }
    finally{
      client.release();
    }
  }
  async toggleLike(user_id: number, event_id: number) {
    const client = await pool.connect();

    const isLikedQuery = `
      SELECT count(*) as count FROM likes WHERE user_id = $1 AND event_id = $2 
    `
    const deleteLikeQuery =
      "DELETE FROM likes WHERE user_id = $1 AND event_id = $2 RETURNING *";
    const reduceLikesCountQuery = `
      UPDATE events
      SET like_count = like_count - 1
      WHERE id = $1
    `;
    const insertLikeQuery = "INSERT INTO likes(user_id, event_id) VALUES ($1, $2)";
    const increaseLikesCountQuery = `
      UPDATE events
      SET like_count = like_count + 1
      WHERE id = $1
    `

    try {
      await client.query('BEGIN');

      const isLikedResult = await client.query(isLikedQuery, [user_id, event_id]);
      const isLiked = isLikedResult.rows[0].count
      if (+isLiked) {
        // the event was liked by current user, so remove like
        await client.query(deleteLikeQuery, [user_id, event_id,]);
        await client.query(reduceLikesCountQuery, [event_id]);

        await client.query('COMMIT');
        return { success: true, message: "Event was unliked successfully." };

      } else {
        // the event was not liked by current user, so add a like
        await client.query(insertLikeQuery, [user_id, event_id]);
        await client.query(increaseLikesCountQuery, [event_id]);

        await client.query('COMMIT');
        return { success: true, message: "Event was liked successfully." };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("An error occurred:", error);
      return {
        success: false,
        message: "An error occurred while changing like status.",
      };
    } finally {
      client.release();
    }
  }
}
