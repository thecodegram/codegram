import { pool } from "../db/db";

export class FriendRepository {
  async createFriendRequest(requesterId: number, requesteeId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const newFriendRequest = await client.query(`
        INSERT INTO friend_request (requester_id, requestee_id)
        VALUES ($1, $2)
        RETURNING friend_request_id
      `, [requesterId, requesteeId])
  
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
          friend_request.requestee_id = $1 AND
          friend_request.is_active = true
        ORDER BY created_at DESC;
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

  async deactivateFriendRequest(friend_request_id: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const updatedFriendRequest = await client.query(`
        UPDATE friend_request
        SET is_active = false
        WHERE friend_request_id = $1;
      `, [friend_request_id]);

      await client.query('COMMIT');
      
      return updatedFriendRequest.rows;
    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to set friend request as inactive for this user:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async createFriend(user1Id: number, user2Id: number) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const newFriend = await client.query(`
        INSERT INTO friend (user_1_id, user_2_id) VALUES ($1, $2) RETURNING user_1_id, user_2_id;
      `, [user1Id, user2Id])
  
      console.log(`Inserted friend with user1Id=${newFriend.rows[0].user_1_id}, user2Id=${newFriend.rows[0].user_2_id}`);
      await client.query('COMMIT');
  
      return newFriend.rows;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

  async getFriends(userId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const friends = await client.query(`
        SELECT f.*, u1.username AS user_1_username, u2.username AS user_2_username
        FROM friend AS f
        INNER JOIN users AS u1 ON f.user_1_id = u1.id
        INNER JOIN users AS u2 ON f.user_2_id = u2.id
        WHERE f.user_1_id = $1 OR f.user_2_id = $1;
      `, [userId]);

      await client.query('COMMIT');
      
      return friends.rows;
    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to get friend requests for this user:", e);
      throw e;
    } finally {
      client.release();
    }
  }
}
