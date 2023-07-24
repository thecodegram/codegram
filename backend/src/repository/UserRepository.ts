import { pool } from "../db/db";


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
}
