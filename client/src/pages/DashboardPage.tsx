import axios from "axios";
import { useState, useEffect } from "react";
import { useUserContext } from "../components/UserContext";
import {
  UserInfoHeader,
  UserInfoHeaderVariant,
} from "../components/UserInfoHeader";
import { AvatarSize } from "../components/Avatar";
import { ListGroup } from "../components/ListGroup";
import { FeedItem } from "../components/FeedItem";
import { UserStatsGrid } from "../components/UserStatsGrid";
import { HeaderNav } from "../components/HeaderNav";
import { FriendsList } from "../components/FriendsList";
import { LoadingEllipsis } from "../components/LoadingEllipsis";
import { EmptyState } from "../components/EmptyState";
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
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
  __typename: string;
}

interface RelationshipProps {
  name: string;
  handle: string;
}

export const groupsDummyData: RelationshipProps[] = [
  {
    name: "372 Group",
    handle: "372group",
  },
  {
    name: "Bobby's Class",
    handle: "bobbychan372",
  },
  {
    name: "SFU Competitive Programming club",
    handle: "sfucpc",
  },
];

const DashboardPage = () => {
  const [feedData, setFeedData] = useState<feedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { username, userId } = useUserContext();
  const { cache, setCache } = useImageCache();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${username}/latestSubmits`,
          {
            withCredentials: true,
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

  //this is new for profile pic
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (username) {
        // this checks if username exists in cache and if  it exists, set profilePic to cached data and if not fetch data from API and then updates the cache
        if (cache[username]) {
          setProfilePic(cache[username]);
        } else {
          try {
            console.log("Fetching profile picture I AM CALLED");
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/user/${username}/profilePicture`,
              {
                responseType: "blob",
                withCredentials: true,
              }
            );
            const profilePicURL = URL.createObjectURL(response.data);

            setCache(username, profilePicURL);
            setProfilePic(profilePicURL);
          } catch (error) {
            console.error("Error fetching profile picture:", error);
          }
        }
      }
    };

    fetchProfilePic();
  }, [username, cache, setCache]);

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
            feedData.map(({ title, timestamp }, index) => (
              <FeedItem
                key={index}
                name={username || ""}
                username={username || ""}
                body={`${username} just solved ${title} on LeetCode!`}
                numOfLikes={Math.floor(Math.random() * 20) + 1}
                createdTime={new Date(+timestamp * 1000)}
              />
            ))
          )}
        </article>
        <article className={styles.relationships}>
          {userId && <FriendsList userId={userId} />}
          <ListGroup title="Groups">
            {groupsDummyData.map(({ name, handle }, index) => (
              <li key={index}>
                <UserInfoHeader username={name} name={handle} />
              </li>
            ))}
          </ListGroup>
        </article>
      </main>
    </>
  );
};

export default DashboardPage;
