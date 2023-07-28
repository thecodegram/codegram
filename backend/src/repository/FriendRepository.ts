import { pool } from "../db/db";

export class FriendRepository {
  async createFriendRequest(requester_id: number, requestee_id: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const newFriendRequest = await client.query(`
        INSERT INTO friend_request (requester_id, requestee_id)
        VALUES ($1, $2)
        RETURNING friend_request_id
      `, [requester_id, requestee_id])
  
      console.log("Inserted friend request with id", newFriendRequest.rows[0].notification_id);
      await client.query('COMMIT');
  
      return newFriendRequest.rows[0].id;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

  async getFriendRequests(userId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const friendRequests = await client.query(`
        SELECT
          friend_request.*,
          requester.username AS requester_username,
          requestee.username AS requestee_username
        FROM
          friend_request
        INNER JOIN
          users AS requester ON friend_request.requester_id = requester.id
        INNER JOIN
          users AS requestee ON friend_request.requestee_id = requestee.id
        WHERE
          friend_request.requestee_id = $1;
      `, [userId]);

      await client.query('COMMIT');
      
      return friendRequests.rows;
    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to get friend requests for this user:", e);
      throw e;
    } finally {
      client.release();
    }
  }
}
