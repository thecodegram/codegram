import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { EmptyState } from "../../components/empty-state/EmptyState"
import { FeedItem } from "../../components/feed-item/FeedItem"

import axios from "axios"

import styles from "../group-profile/GroupProfile.module.scss"

interface ActivityItem {
  eventId: number,
  submitterId: number,
  platform: "leetcode" | "vjudge",
  username: string,
  problemTitle: string,
  problemTitleSlug: string,
  timestamp: number,
  likes: string
}

export const GroupProfileActivity = () => {
  const { groupId } = useParams()
  const [ activtyData, setActivityData ] = useState<ActivityItem[]>([])
  const [ offset, setOffset ] = useState<number>(0)
  const limit = 25

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/events/group?group_id=${groupId}&offset=${offset}&limit=${limit}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setActivityData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (groupId) {
      fetchData();
    }
  }, [groupId, offset]);

  return <article className={styles.groupProfileActivity}>
    {activtyData.length === 0 
      ? <EmptyState>No activity yet</EmptyState>
      : activtyData.map(({ username, platform, problemTitle, problemTitleSlug, likes, timestamp }, index) => <FeedItem 
          key={index}
          name={username}
          username={username}
          platform={platform}
          problemTitle={problemTitle}
          problemTitleSlug={problemTitleSlug}
          numOfLikes={+likes}
          createdTime={new Date(timestamp)}
        />
      )
    }
  </article>
}