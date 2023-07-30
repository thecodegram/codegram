import { pool } from "../db/db";

export class GroupRepository {
  async createGroupInvite(groupId: number, inviteeId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const newGroupInvite = await client.query(`
        INSERT INTO group_invite (group_id, invitee_id)
        VALUES ($1, $2)
        RETURNING group_invite_id
      `, [groupId, inviteeId])
  
      console.log("Inserted group invite with id", newGroupInvite.rows[0].group_invite_id);
      await client.query('COMMIT');
  
      return newGroupInvite.rows[0].id;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

  async getGroupInvites(userId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const groupInvites = await client.query(`
        SELECT * FROM group_invite
        WHERE invitee_id = $1
      `, [userId])
  
      await client.query('COMMIT');
  
      return groupInvites.rows;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

  async deactivateGroupInvite(groupInviteId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const updatedGroupInvite = await client.query(`
        UPDATE group_invite
        SET is_active = false
        WHERE group_invite_id = $1;
      `, [groupInviteId]);

      await client.query('COMMIT');
      
      return updatedGroupInvite.rows;
    } catch(e) {
      await client.query('ROLLBACK');
      console.error("Failed to set friend request as inactive for this user:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async createGroup(groupName: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const newGroup = await client.query(`
        INSERT INTO grind_group (name)
        VALUES ($1)
        RETURNING group_id
      `, [groupName])
  
      console.log("Inserted group with id", newGroup.rows[0].group_id);
      await client.query('COMMIT');
  
      return newGroup.rows[0].id;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

  async getGroups(userId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const groups = await client.query(`
        SELECT gg.group_id, gg.name, gg.created_at
        FROM group_member gm
        JOIN grind_group gg ON gm.group_id = gg.group_id
        WHERE gm.user_id = $1;
      `, [userId])
  
      await client.query('COMMIT');
  
      return groups.rows;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

  async createGroupMember(groupId: number, userId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const newGroupMember = await client.query(`
        INSERT INTO group_member (group_id, user_id)
        VALUES ($1, $2)
        RETURNING group_id
      `, [groupId, userId])
  
      console.log("Inserted group_member with id", newGroupMember.rows[0].group_id);
      await client.query('COMMIT');
  
      return newGroupMember.rows[0].id;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

  async getGroupMembers(groupId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const groups = await client.query(`
        SELECT u.id, u.mongo_id, u.username, u.current_rank, u.previous_rank, u.score
        FROM group_member gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = $1;      
      `, [groupId])
  
      await client.query('COMMIT');
  
      return groups.rows;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }
}
