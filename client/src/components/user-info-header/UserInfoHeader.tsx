import { Link } from "react-router-dom";
import { Avatar, AvatarSize } from "../avatar/Avatar";
import { IconVerifiedBadge } from "../../icons";

import styles from "./UserInfoHeader.module.scss";
import { useEffect, useState } from "react";
import { useImageCache } from "../image-cache-context/ImageCacheContext";
import axios from "axios";

export enum UserInfoHeaderVariant {
  default = "default",
  column = "column",
  row = "row",
}

interface UserInfoHeaderProps {
  username: string;
  name: string;
  variant?: UserInfoHeaderVariant;
  avatarSize?: AvatarSize;
  profilePic?: string | null;
}

export const UserInfoHeader = ({
  username,
  name,
  variant = UserInfoHeaderVariant.default,
  avatarSize = AvatarSize.regular
}: UserInfoHeaderProps) => {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { cache, setCache, loadingCache, addUsernameToLoadingCache } = useImageCache();
  
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (username) {
        if(loadingCache.has(username)){
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
    // eslint-disable-next-line
  }, [username, setCache]);

  return (
    <article className={`${styles.profileInfoHeader} ${styles[variant]}`}>
      <Link to={`/u/${username}`} relative="path">
        <Avatar username={username} size={avatarSize} profilePic={profilePic} />
        <div className={styles.userInfo}>
          <h2>{name}</h2>
          <IconVerifiedBadge />
          <p>@{username}</p>
        </div>
      </Link>
    </article>
  );
};
