import {
  UserInfoHeader,
  UserInfoHeaderVariant,
} from "../user-info-header/UserInfoHeader";
import { IconLikeBtnHeart } from "../../icons";
import { useImageCache } from "../image-cache-context/ImageCacheContext";
import styles from "./FeedItem.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";

interface FeedItemProps {
  name: string;
  username: string;
  platform: string;
  problemTitle: string;
  problemTitleSlug: string;
  numOfLikes: number;
  createdTime: Date;
  showFullInfo?: boolean;
  isLikedByCurrentUser?: boolean;
  currentEventid: number;
}

const prettifyPlatform = (platform: string) => {
  if (platform === "leetcode") return "LeetCode";
  else return "VJudge";
};

const getLink = (problemTitleSlug: string, platform: string) => {
  if (platform === "leetcode") {
    return `https://leetcode.com/problems/${problemTitleSlug}/`;
  } else if (platform === "vjudge") {
    return `https://vjudge.net/problem/${problemTitleSlug}`;
  } else {
    console.error("Problem platform not recognized!");
  }
};
export const FeedItem = ({
  name,
  username,
  platform,
  problemTitle,
  problemTitleSlug,
  numOfLikes,
  createdTime,
  showFullInfo = true,
  isLikedByCurrentUser,
  currentEventid,
}: FeedItemProps) => {
  const { cache, setCache, loadingCache, addUsernameToLoadingCache } = useImageCache();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(numOfLikes);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (username) {
        if(loadingCache.has(username)){
          console.log("This pfp is to be loaded by another component");
          return;
        }
        // this checks if username exists in cache and if  it exists, set profilePic to cached data and if not fetch data from API and then updates the cache
        const currentCache = cache[username];
        if (currentCache === undefined || currentCache === null) {
          addUsernameToLoadingCache(username);
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/user/${username}/profilePicture`,
              {
                responseType: "blob",
                withCredentials: true,
              }
            );
            if (response.status !== 204) {
              console.log(response.data)
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

  const handleLikeClick = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/events/like`,
        {
          event_id: currentEventid,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        if (isLiked) {
          setLikesCount(likesCount - 1); 
        } else {
          setLikesCount(likesCount + 1); 
        }
        setIsLiked(!isLiked); 
        console.log(response.data); 
      }
    } catch (error) {
      console.error("Error liking the event:", error);
    }
  };

  return (
    <article className={styles.feedItem}>
      <section className={styles.header}>
        {showFullInfo && (
          <UserInfoHeader
            username={username}
            name={name}
            variant={UserInfoHeaderVariant.row}
            profilePic={profilePic}
          />
        )}
        {showFullInfo && <div className={styles.dot}></div>}
        <p className={styles.detailText}>{createdTime.toDateString()}</p>
      </section>
      <section className={styles.body}>
        <p>
          {`${username} solved `}
          <a
            href={getLink(problemTitleSlug, platform)}
            target="_blank"
            rel="noreferrer"
          >
            {`${problemTitle}`}
          </a>
          {` on ${prettifyPlatform(platform)}!`}
        </p>
      </section>
      <section className={styles.footer}>
        <button onClick={handleLikeClick}>
          <IconLikeBtnHeart fill={isLiked ? "#FF1569" : "#D7D6D5"} /> {likesCount}
        </button>
      </section>
    </article>
  );
};
