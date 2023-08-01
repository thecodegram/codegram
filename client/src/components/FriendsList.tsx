import { ListGroup } from "./ListGroup";
import { UserInfoHeader } from "./UserInfoHeader";
import { useState, useEffect, useCallback } from "react";
import { FriendItem } from "../pages/AllFriendsPage";
import { EmptyState } from "./EmptyState";
import { Link } from "react-router-dom";
import { useUserContext } from "./UserContext";
import styles from "./ListGroup.module.scss";
import axios from "axios";
import { useImageCache } from "./ImageCacheContext";

interface FriendsListProps {
  userId: number | null;
}

export const FriendsList = ({ userId }: FriendsListProps) => {
  const { userId: sessionUserId } = useUserContext();
  const { cache, setCache } = useImageCache();
  const [ friendsData, setFriendsData ] = useState<FriendItem[]>([]);
  const showViewAllBtn = sessionUserId === userId;

  const fetchProfilePic = useCallback(
    async (username: string) => {
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
            return profilePicURL;
          } else {
            setCache(username, "");
            return "";
          }
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      } else {
        return currentCache;
      }
    },
    [cache, setCache]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/friends`,
          {
            withCredentials: true,
          }
        );
        const friends = await response.data;

        // Create a new friendsData array with profilePic data for each friend
        const friendsData = await Promise.all(
          friends.map(async (friend: FriendItem) => {
            const username =
              userId === friend.user_1_id
                ? friend.user_2_username
                : friend.user_1_username;
            const profilePic = await fetchProfilePic(username);
            return { ...friend, profilePic: profilePic };
          })
        );

        setFriendsData(friendsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, fetchProfilePic]);
  
  return (
    <article className={styles.friendsList}>
      {showViewAllBtn && (
        <Link to={`/friends`} relative="path" className={styles.viewAll}>
          View all
        </Link>
      )}
      <ListGroup title="Friends">
        {friendsData.length === 0 || !userId ? (
          <EmptyState>No friends yet</EmptyState>
        ) : (
          friendsData
            .slice(0, 3)
            .map(
              (
                { user_1_id, user_1_username, user_2_username, profilePic },
                index
              ) => (
                <li key={index}>
                  <UserInfoHeader
                    username={
                      userId === user_1_id ? user_2_username : user_1_username
                    }
                    name={
                      userId === user_1_id ? user_2_username : user_1_username
                    }
                    profilePic={profilePic}
                  />
                </li>
              )
            )
        )}
      </ListGroup>
    </article>
  );
};
