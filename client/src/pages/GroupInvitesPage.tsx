import { useState, useEffect } from "react"
import axios from "axios"
import { useUserContext } from "../components/UserContext"
import { ListGroup } from "../components/ListGroup"
import { Button, ButtonVariant } from "../components/Button"
import { EmptyState } from "../components/EmptyState"

import styles from "./FriendsPage.module.scss"

interface GroupInviteItem {
  group_invite_id: number,
  group_id: number,
  group_name: string,
  invitee_id: number,
  is_active: boolean,
  created_at: string
}

export const GroupInvitesPage = () => {
  const { userId } = useUserContext()
  const [ groupInvitesData, setGroupInvitesData] = useState<GroupInviteItem[]>([])
  const [ forceRerender, setForceRerender ] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/group-invites`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setGroupInvitesData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId, forceRerender]);

  const onClickRemoveGroupInvite = async (groupId: number, groupInviteId: number) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/group/${groupId}/group-invites/${groupInviteId}/remove`, {},
        {
          withCredentials: true,
        }
      );
      setForceRerender(!forceRerender);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const onClickAcceptGroupInvite = async (groupId: number, groupInviteId: number) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/group/${groupId}/group-invites/${groupInviteId}/accept`,
        {
          userId
        },
        {
          withCredentials: true,
        }
      );
      setForceRerender(!forceRerender);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return <article>
    {groupInvitesData.length === 0 
      ? <EmptyState>No group invites</EmptyState>
      : <ListGroup>
          {groupInvitesData.map(({ group_invite_id, group_id, group_name, created_at }, index) => 
            <article className={styles.friendRequestListItem} key={index}>
              <div className={styles.userInfo}>
              <h3>{group_name}</h3>
              <p>Sent {new Date(created_at).toDateString()}</p>
              </div>
              <div className={styles.actions}>
                <Button 
                  variant={ButtonVariant.secondary} 
                  onClick={() => onClickAcceptGroupInvite(group_id, group_invite_id)}>
                    Accept
                </Button>
                <Button 
                  variant={ButtonVariant.tetriary}
                  onClick={() => onClickRemoveGroupInvite(group_id, group_invite_id)}>
                    Remove
                </Button>
              </div>
            </article>
          )}
        </ListGroup> 
    }
  </article>
}