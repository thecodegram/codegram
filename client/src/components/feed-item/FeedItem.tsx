import { UserInfoHeader, UserInfoHeaderVariant } from "../user-info-header/UserInfoHeader";
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
}: FeedItemProps) => {
  const { cache, setCache } = useImageCache();
  const [profilePic, setProfilePic] = useState<string | null>(null);

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

    if (username) {
      fetchProfilePic();
    }
  }, [username, setCache]);
  /* eslint-disable react-hooks/exhaustive-deps */

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
        <button>
          <IconLikeBtnHeart />
          {numOfLikes}
        </button>
      </section>
    </article>
  );
};
