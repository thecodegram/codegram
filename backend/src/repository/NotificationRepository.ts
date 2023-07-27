import { pool } from "../db/db";

export enum NotificationTypes {
  friend = "friend",
  group = "group"
}

export class NotificationRepository {
  async getNotifications(userId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const notifications = await client.query(`
        SELECT * 
        FROM notification 
        WHERE recipient_id = $1
        ORDER BY created_at DESC
      `, [userId]);

      await client.query('COMMIT');
      
      return notifications.rows;
    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to get notifications for this user:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async createNotification(userId: number, message: string, type: NotificationTypes) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const instertNotification = await client.query(`
        INSERT INTO notification (message, recipient_id, type) 
        VALUES ($1, $2, $3) 
        RETURNING notification_id
      `, [message, userId, type]);

      console.log("Inserted notification with id", instertNotification.rows[0].notification_id);
      await client.query('COMMIT');

      return instertNotification.rows[0].id;
    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to insert user into PostgreSQL database:", e);
      throw e;
    } finally {
      client.release();
    }
  }
}
