import axios from "axios";
import { useState, useEffect } from "react";
import { useUserContext } from "../components/UserContext";
import {
  UserInfoHeader,
  UserInfoHeaderVariant,
} from "../components/UserInfoHeader";
import { AvatarSize } from "../components/Avatar";
import { FeedItem } from "../components/FeedItem";
import { UserStatsGrid } from "../components/UserStatsGrid";
import { HeaderNav } from "../components/HeaderNav";
import { FriendsList } from "../components/FriendsList";
import { LoadingEllipsis } from "../components/LoadingEllipsis";
import { EmptyState } from "../components/EmptyState";
import { GroupsList } from "../components/GroupsList";

import { useImageCache } from "../components/ImageCacheContext";
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
  };
}

export interface feedData {
  eventId: number,
  submitterId: number,
  platform: string,
  username: string,
  problemTitle: string;
  problemTitleSlug: string;
  timestamp: string;
  likes: number
}

const DashboardPage = () => {
  const [feedData, setFeedData] = useState<feedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { username, userId } = useUserContext();
  const { cache, setCache } = useImageCache();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = {
          offset: 0,
          limit: 15
        }
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/events/feed`,
          {
            withCredentials: true,
            params: payload
          }
        );
        const jsonData = await response.data;

        setFeedData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [username]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (username) {
        // this checks if username exists in cache and if  it exists, set profilePic to cached data and if not fetch data from API and then updates the cache
        const currentCache = cache[username];
        if (currentCache === undefined || currentCache === null) {
          try {
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
          setProfilePic(currentCache);
        }
      }
    };

    fetchProfilePic();
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
          {loading
            ? <LoadingEllipsis />
            : feedData.length === 0
              ? <EmptyState>No activity yet</EmptyState>
              : feedData.map((
                { problemTitle, problemTitleSlug, timestamp, platform, likes }, index) => (
                <FeedItem
                  key={index}
                  name={username || ""}
                  username={username || ""}
                  platform={platform}
                  problemTitle={problemTitle}
                  numOfLikes={likes}
                  problemTitleSlug={problemTitleSlug}
                  createdTime={new Date(timestamp)}
                />
              ))
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
