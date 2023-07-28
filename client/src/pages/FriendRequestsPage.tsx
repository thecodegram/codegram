import { useState, useEffect } from "react"
import axios from "axios"
import { useUserContext } from "../components/UserContext"
import { ListGroup } from "../components/ListGroup"
import { Button, ButtonVariant } from "../components/Button"
import { EmptyState } from "../components/EmptyState"

import styles from "./FriendsPage.module.scss"

interface FriendRequestItem {
  friend_request_id: number,
  requester_id: number,
  requestee_id: number,
  is_active: boolean,
  created_at: string,
  requester_username: string,
  requestee_username: string
}

export const FriendRequestsPage = () => {
  const { userId } = useUserContext()
  const [ friendRequestsData, setFriendRequestsData] = useState<FriendRequestItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/friend-requests`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setFriendRequestsData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const onClickRemoveFriendRequest = async (friendRequestId: number) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/${userId}/friend-requests/${friendRequestId}/remove`, {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const onClickAcceptFriendRequest = async (friendRequestId: number, requesterId: number) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/${userId}/friend-requests/${friendRequestId}/accept`,
        {
          requesterId
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return <article>
    {friendRequestsData.length === 0 
      ? <EmptyState>No friend requests</EmptyState>
      : <ListGroup>
          {friendRequestsData.map(({ friend_request_id, requester_id, requester_username, created_at }, index) => 
            <article className={styles.friendRequestListItem} key={index}>
              <div className={styles.userInfo}>
              <h3>@{requester_username}</h3>
              <p>Sent {new Date(created_at).toDateString()}</p>
              </div>
              <div className={styles.actions}>
              <Button 
                variant={ButtonVariant.secondary} 
                onClick={() => onClickAcceptFriendRequest(friend_request_id, requester_id)}>
                  Accept
              </Button>
              <Button 
                variant={ButtonVariant.tetriary}
                onClick={() => onClickRemoveFriendRequest(friend_request_id)}>
                  Remove
              </Button>
              </div>
            </article>
          )}
        </ListGroup> 
    }
  </article>
}