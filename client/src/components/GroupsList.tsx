import { ListGroup } from "./ListGroup"
import { useState, useEffect } from "react"
import { EmptyState } from "./EmptyState"
import { Link } from "react-router-dom"
import { useUserContext } from "./UserContext"
import { Avatar } from "./Avatar"

import styles from "./ListGroup.module.scss"
import axios from "axios"

interface GroupsListProps {
  userId: number | null
}

export const GroupsList = ({ userId }: GroupsListProps) => {
  const { userId: sessionUserId } = useUserContext()
  const [ groupsData, setGroupsData] = useState([])
  const showViewAllBtn = sessionUserId === userId

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

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return <article className={styles.friendsList}>
    {showViewAllBtn && <Link to={`/groups`} relative="path" className={styles.viewAll}>View all</Link>}
    <ListGroup title='Groups'>
      {groupsData.length === 0 || !userId
        ? <EmptyState>No groups yet</EmptyState>
        : groupsData.slice(0, 3).map(({ group_id, name }, index) => (
          <li key={index} className={styles.groupsListItem}>
            <Link to={`/g/${group_id}`} relative="path">
              <Avatar username={name} />
              <p>{name}</p>
            </Link>
          </li>
        ))
      }
    </ListGroup>
  </article>
}