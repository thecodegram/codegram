import { pool } from "../db/db";

export class GroupRepository {
  async getGroupInfo(groupId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const group = await client.query(`
        SELECT * FROM grind_group
        WHERE group_id = $1
      `, [groupId])
  
      await client.query('COMMIT');
  
      return group.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }

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
        SELECT 
          group_invite.*, grind_group.name as group_name
        FROM 
          group_invite
        INNER JOIN 
          grind_group ON group_invite.group_id  = grind_group.group_id
        WHERE 
          group_invite.invitee_id = $1 AND 
          is_active = true
        ORDER BY 
          created_at DESC;
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
  
      return newGroup.rows[0];
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
        WHERE gm.user_id = $1
        ORDER BY created_at DESC
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

  async isGroupMember(groupId: number, userId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const isGroupMember = await client.query<{is_member: boolean}>(`
        SELECT EXISTS (
          SELECT 1
          FROM group_member
          WHERE group_id = $1
          AND user_id = $2
        ) AS is_member;
      `, [groupId, userId])
  
      await client.query('COMMIT');
  
      return isGroupMember.rows[0].is_member;
    } catch (e) {
      await client.query('ROLLBACK');
      return false
    } finally {
      client.release()
    }
  }

  async removeGroupMember(groupId: number, userId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(`
        DELETE FROM 
          group_member
        WHERE
          group_id = $1 AND
          user_id = $2
      `, [groupId, userId])
  
      await client.query('COMMIT');
  
      return result.rows;
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release()
    }
  }
}

export const groupRepository = new GroupRepository();
