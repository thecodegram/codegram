import { ListGroup } from "./ListGroup"
import { UserInfoHeader } from "./UserInfoHeader"
import { useState, useEffect } from "react"
import { FriendItem } from "../pages/AllFriendsPage"
import { EmptyState } from "./EmptyState"
import { Link } from "react-router-dom"
import { useUserContext } from "./UserContext"
import styles from "./ListGroup.module.scss"
import axios from "axios"

interface FriendsListProps {
  userId: number | null
}

export const FriendsList = ({ userId }: FriendsListProps) => {
  const { userId: sessionUserId } = useUserContext()
  const [ friendsData, setFriendsData] = useState<FriendItem[]>([])
  const showViewAllBtn = sessionUserId === userId

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/friends`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setFriendsData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  return <article className={styles.friendsList}>
    {showViewAllBtn && <Link to={`/friends`} relative="path" className={styles.viewAll}>View all</Link>}
    <ListGroup title='Friends'>
      {friendsData.length === 0 || !userId
        ? <EmptyState>No friends yet</EmptyState>
        : friendsData.slice(0, 3).map(({ user_1_id, user_1_username, user_2_username }, index) => (
          <li key={index}>
            <UserInfoHeader 
              username={userId === user_1_id ? user_2_username : user_1_username} 
              name={userId === user_1_id ? user_2_username : user_1_username} 
            />
          </li>
        ))
      }
    </ListGroup>
  </article>
}