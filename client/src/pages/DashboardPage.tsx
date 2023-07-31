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
  },
  postgres: {
    id: number
  }
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

  //new for profile pic
  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${username}/profilePicture`,
          {
            responseType: "blob",
            withCredentials: true,
          }
        );
        // creates a local URL for the Blob
        const profilePicURL = URL.createObjectURL(response.data);
        setProfilePic(profilePicURL);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePic();
  }, [username]);

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
  )
};

export default DashboardPage;
