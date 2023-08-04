import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useUserContext } from "../../contexts/UserContext";
import {
  UserInfoHeader,
  UserInfoHeaderVariant,
} from "../../components/user-info-header/UserInfoHeader";
import { AvatarSize } from "../../components/avatar/Avatar";
import { FeedItem } from "../../components/feed-item/FeedItem";
import { UserStatsGrid } from "../../components/user-stats-grid/UserStatsGrid";
import { HeaderNav } from "../../components/header-nav/HeaderNav";
import { FriendsList } from "../../components/friends-list/FriendsList";
import { LoadingEllipsis } from "../../components/loading-ellipsis/LoadingEllipsis";
import { EmptyState } from "../../components/empty-state/EmptyState";
import { GroupsList } from "../../components/groups-list/GroupsList";

import { useImageCache } from "../../components/image-cache-context/ImageCacheContext";
import styles from "./DashboardPage.module.scss";

export interface UserInfoData {
  mongo: {
    username?: string;
    leetcode: {
      submitStats?: {
        acSubmissionNum: {
          difficulty: string;
          count: number;
          submissions: number;
        }[];
      };
    };
  };
  postgres: {
    id: number;
    current_rank: number,
    previous_rank: number,
    score: number;
  };
}

export interface feedData {
  submitterId: number;
  platform: string;
  username: string;
  problemTitle: string;
  problemTitleSlug: string;
  timestamp: string;
  likes: number;
  likedByCurrentUser: boolean;
  eventId: number;
}

const DashboardPage = () => {
  const [ profilePic, setProfilePic ] = useState<string | null>(null);
  const { username, userId } = useUserContext();
  const { cache, setCache, loadingCache, addUsernameToLoadingCache } = useImageCache();

  const [ feedData, setFeedData ] = useState<feedData[]>([]);
  const bottomOfFeedRef = useRef<HTMLDivElement>(null)
  const [ offset, setOffset ] = useState<number>(0)
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ isEndOfOffset, setIsEndOfOffset ] = useState<boolean>(false)
  const [ isDelayActive, setIsDelayActive ] = useState<boolean>(false)
  const [ doneFirstRequest, setDoneFirstRequest ] = useState<boolean>(false);

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
          `${process.env.REACT_APP_API_URL}/api/events/feed?offset=${offset}&limit=${limit}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;

        if (jsonData && jsonData.length < limit) {
          setIsEndOfOffset(true);
          setOffset(prevOffset => prevOffset - limit + jsonData.length);
        }

        setFeedData((a) => [...a, ...jsonData]);
        setLoading(false);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (username) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [username, offset, doneFirstRequest]);

  useEffect(() => {
    if (!bottomOfFeedRef.current) return;
    // setStartedObserving(true);
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
        setIsDelayActive(true);
      }
    }, options);
    scrollObserver.observe(bottomOfFeedRef.current);
    // eslint-disable-next-line
  }, [isDelayActive, loading, offset, isEndOfOffset]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (username) {
        if(loadingCache.has(username)){
          return;
        }
        // this checks if username exists in cache and if  it exists, set profilePic to cached data and if not fetch data from API and then updates the cache
        const currentCache = cache[username];
        if (currentCache === undefined || currentCache === null) {
          try {
            // notify other components not to load this image again
            addUsernameToLoadingCache(username);
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/user/${username}/profilePicture`,
              {
                responseType: "blob",
                withCredentials: true,
              }
            );
            if (response.status !== 204) {
              const profilePicURL = URL.createObjectURL(response.data);

              setCache(username, profilePicURL);
              setProfilePic(profilePicURL);
            } else {
              setCache(username, "");
              setProfilePic("");
            }
          } catch (error) {
            console.error("Error fetching profile picture:", error);
          }
        } else {
          setProfilePic(currentCache.imageData);
        }
      }
    };

    
    if (username) {
      fetchProfilePic();
    }
  }, [username, setCache]);
  /* eslint-disable react-hooks/exhaustive-deps */

  // const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setUsername(event.target.value);
  // };

  // const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   fetchData();
  // };

  return (
    <>
      <HeaderNav />
      <main className={styles.main}>
        <article className={styles.stats}>
          <UserInfoHeader
            username={username || ""}
            name={username || ""}
            variant={UserInfoHeaderVariant.column}
            avatarSize={AvatarSize.medium}
            profilePic={profilePic}
          />

          {username && <UserStatsGrid username={username} />}
        </article>
        <article className={styles.feed}>
          {loading ? (
            <LoadingEllipsis />
          ) : feedData.length === 0 ? (
            <EmptyState>No activity yet</EmptyState>
          ) : (
            <>
              {feedData.map(
                (
                  {
                    username,
                    problemTitle,
                    problemTitleSlug,
                    timestamp,
                    platform,
                    likes,
                    likedByCurrentUser,
                    eventId,
                  },
                  index
                ) => (
                  <FeedItem
                    key={index}
                    name={username || ""}
                    username={username || ""}
                    platform={platform}
                    problemTitle={problemTitle}
                    numOfLikes={likes}
                    problemTitleSlug={problemTitleSlug}
                    createdTime={new Date(timestamp)}
                    isLikedByCurrentUser={likedByCurrentUser}
                    currentEventid={eventId}
                  />
                )
              )}
              <div ref={bottomOfFeedRef} style={{ width: "100%", height: "1px" }}></div>
            </>
          )
        }
        </article>
        <article className={styles.relationships}>
          {userId && <FriendsList userId={userId} />}
          {userId && <GroupsList userId={userId} />}
        </article>
      </main>
    </>
  );
};

export default DashboardPage;
