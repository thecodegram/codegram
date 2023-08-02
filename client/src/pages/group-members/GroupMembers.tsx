import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { ListGroup } from "../../components/list-group/ListGroup"
import { EmptyState } from "../../components/empty-state/EmptyState"
import { Link } from "react-router-dom"

import axios from "axios"

import styles from "../group-profile/GroupProfile.module.scss"

interface GroupMember {
  id: number,
  mongo_id: string,
  username: string,
  current_rank: number,
  previous_rank: number,
  score: number
}

export const GroupProfileMembers = () => {
  const { groupId } = useParams()
  const [ membersData, setMembersData ] = useState<GroupMember[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/group/${groupId}/members`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setMembersData (jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [groupId]);

  return <article>
    {membersData.length === 0 
      ? <EmptyState>No members</EmptyState>
      : <ListGroup>
          {membersData.map(({ username }, index) => <article className={styles.groupMemberItem} key={index}>
              <Link to={`/u/${username}`} relative="path">
                <h3>@{username}</h3>
              </Link>
            </article>
          )}
        </ListGroup> 
    }
  </article>
}