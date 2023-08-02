import { useState, useEffect } from "react"
import axios from "axios"
import { useUserContext } from "../../contexts/UserContext"
import { ListGroup } from "../../components/list-group/ListGroup"
import { EmptyState } from "../../components/empty-state/EmptyState"
import { Link } from "react-router-dom"

import styles from "../friends/FriendsPage.module.scss"

export interface GroupItem {
  group_id: number,
  name: string,
  created_at: string
}

export const AllGroupsPage = () => {
  const { userId } = useUserContext()
  const [ groupsData, setGroupsData] = useState<GroupItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/groups`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setGroupsData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  return <article>
    {groupsData.length === 0 
      ? <EmptyState>No groups</EmptyState>
      : <ListGroup>
          {groupsData.map(({ group_id, name }, index) => 
            <article className={styles.friendListItem} key={index}>
              <Link to={`/g/${group_id}`} relative="path">
                <h3>{name}</h3>
              </Link>
            </article>
          )}
        </ListGroup> 
    }
  </article>
}