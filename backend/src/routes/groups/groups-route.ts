import express, { Request, Response } from "express";
import { GroupRepository } from "../../repository/GroupRepository";
import { UserRepository } from "../../repository/UserRepository";
import { handleValidationErrors } from "../../utils/middleware";

const router = express.Router();
const groupRepository = new GroupRepository()
const userRepository = new UserRepository()

router.post("", [
  handleValidationErrors
], async (req: Request, res: Response) => {
  if (req.session && req.session.username) {
    const { name } = req.body;
  
    try {
      const newGroup = await groupRepository.createGroup(name)

      const userInfo = await userRepository.getUser(req.session.username);
      await groupRepository.createGroupMember(+newGroup.group_id, +userInfo.id)
  
      res.status(200).json(newGroup)
    } catch (err) {
      console.log(err)
      res.status(500).send("Failed to create new group")
    }
  }
})

router.post("/:groupId/send-group-invite/:inviteeId", [
  handleValidationErrors
], async (req: Request, res: Response) => {
  if (req.session && req.session.username) {
    const { groupId, inviteeId } = req.params
  
    try {
      const userInfo = await userRepository.getUser(req.session.username);
      const isGroupMember = await groupRepository.isGroupMember(+groupId, +userInfo.id)

      if (isGroupMember) {
        const newGroupInvite = await groupRepository.createGroupInvite(+groupId, +inviteeId)
        res.status(200).json(newGroupInvite)
      } else {
        res.status(401).send("Failed to send group invite because inviter is not a group member")
      }
    } catch (err) {
      res.status(500).send("Failed to send group invite")
    }
  }
})

router.get("/:groupId/members", [
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const groupMembers = await groupRepository.getGroupMembers(+groupId)

    res.status(200).json(groupMembers)
  } catch (err) {
    console.log(err)
    res.status(500).send("Failed to get group members")
  }
})

router.get("/:groupId/is-member/:userId", [
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { groupId, userId } = req.params;

  try {
    const isGroupMember = await groupRepository.isGroupMember(+groupId, +userId)

    res.status(200).json({ is_group_member: isGroupMember })
  } catch (err) {
    console.log(err)
    res.status(500).send("Failed to validate if user is group member")
  }
})

router.post('/:groupId/group-invites/:groupInviteId/accept', [
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { groupId, groupInviteId } = req.params

  try {
    const newGroupMember = await groupRepository.createGroupMember(+groupId, +groupInviteId)
    await groupRepository.deactivateGroupInvite(+groupInviteId)

    res.status(200).json(newGroupMember)
  } catch (err) {
    res.status(500).send("Failed to accept group invite")
  }
})

router.post('/:groupId/group-invites/:groupInviteId/remove', [
  handleValidationErrors
], async (req: Request, res: Response) => {
  const { groupInviteId } = req.params

  try {
    const updatedGroupInvite = await groupRepository.deactivateGroupInvite(+groupInviteId)

    res.status(200).json(updatedGroupInvite)
  } catch (err) {
    res.status(500).send("Failed to remove group invite")
  }
})

module.exports = router;
