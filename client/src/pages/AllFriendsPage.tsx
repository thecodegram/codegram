import { useState, useEffect } from "react"
import axios from "axios"
import { useUserContext } from "../components/UserContext"
import { ListGroup } from "../components/ListGroup"
import { EmptyState } from "../components/EmptyState"
import { Link } from "react-router-dom"

import styles from "./FriendsPage.module.scss"

export interface FriendItem {
  user_1_id: number,
  user_2_id: number,
  user_1_username: string,
  user_2_username: string,
  created_at: string
  profilePic?: string | null;
}

export const AllFriendsPage = () => {
  const { userId, username } = useUserContext()
  const [ friendsData, setFriendsData] = useState<FriendItem[]>([])

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
    if(userId) {
      fetchData();
    }
  }, [userId]);

  return <article>
    {friendsData.length === 0 
      ? <EmptyState>No friends</EmptyState>
      : <ListGroup>
          {friendsData.map(({ user_1_username, user_2_username }, index) => {
            const friendUsername = username === user_1_username ? user_2_username : user_1_username

            return <article className={styles.friendListItem} key={index}>
              <Link to={`/u/${friendUsername}`} relative="path">
                <h3>@{friendUsername}</h3>
              </Link>
            </article>
          }
          )}
        </ListGroup> 
    }
  </article>
}