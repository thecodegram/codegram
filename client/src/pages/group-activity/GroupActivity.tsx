import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { EmptyState } from "../../components/empty-state/EmptyState";
import { FeedItem } from "../../components/feed-item/FeedItem";

import axios from "axios";

import styles from "../group-profile/GroupProfile.module.scss";

interface ActivityItem {
  eventId: number;
  submitterId: number;
  platform: "leetcode" | "vjudge";
  username: string;
  problemTitle: string;
  problemTitleSlug: string;
  timestamp: number;
  likes: string;
  likedByCurrentUser: boolean;
}

export const GroupProfileActivity = () => {
  const { groupId } = useParams()
  const [ activityData, setActivityData ] = useState<ActivityItem[]>([])
  const bottomOfFeedRef = useRef<HTMLDivElement>(null)
  const [ offset, setOffset ] = useState<number>(0)
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ isEndOfOffset, setIsEndOfOffset ] = useState<boolean>(false)
  const [ isDelayActive, setIsDelayActive ] = useState<boolean>(false)
  const [ doneFirstRequest, setDoneFirstRequest ] = useState<boolean>(false);
  const [startedObserving, setStartedObserving] = useState<boolean>(false);

  const limit = 25;
  useEffect(() => {
    const delayMs: number = 1000;
    let delayTimer: NodeJS.Timeout | null = null;

    if (isDelayActive) {
      delayTimer = setTimeout(() => setIsDelayActive(false), delayMs);
    }

    return () => {
      if (delayTimer) {
        clearTimeout(delayTimer);
      }
    };
  }, [isDelayActive]);

  useEffect(() => {
    if(isEndOfOffset) return;
    const fetchData = async () => {
      if (!doneFirstRequest) {
        setDoneFirstRequest(true)
        return
      }

      setLoading(true);

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/events/group?group_id=${groupId}&offset=${offset}&limit=${limit}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;

        if (jsonData && jsonData.length < limit) {
          setIsEndOfOffset(true);
          setOffset(prevOffset => prevOffset - limit + jsonData.length);
          return;
        }

        setActivityData((a) => [...a, ...jsonData]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (groupId) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [groupId, offset, doneFirstRequest]);

  useEffect(() => {
    if (!bottomOfFeedRef.current || startedObserving) return;
    setStartedObserving(true);
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const scrollObserver = new IntersectionObserver((entries) => {
      if (
        !isDelayActive &&
        entries?.[0]?.isIntersecting &&
        !loading &&
        !isEndOfOffset
      ) {
        setOffset(prevOffset => prevOffset + limit);
        console.log("changed offset to", offset);
        setIsDelayActive(true);
      }
    }, options);
    console.log("Now observing the scroll bar");
    scrollObserver.observe(bottomOfFeedRef.current);
    // eslint-disable-next-line
  }, [startedObserving, isDelayActive, loading, offset]);

  return (
    <article className={styles.groupProfileActivity}>
      {activityData.length === 0 ? (
        <EmptyState>No activity yet</EmptyState>
      ) : (
        <>
          {activityData.map(
            (
              {
                username,
                platform,
                problemTitle,
                problemTitleSlug,
                likes,
                timestamp,
                likedByCurrentUser,
                eventId
              },
              index
            ) => (
              <FeedItem
                key={index}
                name={username}
                username={username}
                platform={platform}
                problemTitle={problemTitle}
                problemTitleSlug={problemTitleSlug}
                numOfLikes={+likes}
                createdTime={new Date(timestamp)}
                isLikedByCurrentUser={likedByCurrentUser}
                currentEventid={eventId}
              />
            )
          )}
          <div
            ref={bottomOfFeedRef}
            style={{ width: "100%", height: "1px" }}
          ></div>
        </>
      )}
    </article>
  );
};
