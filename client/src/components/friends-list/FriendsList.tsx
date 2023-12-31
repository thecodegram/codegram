import { ListGroup } from "../list-group/ListGroup";
import { UserInfoHeader } from "../user-info-header/UserInfoHeader";
import { useState, useEffect } from "react";
import { FriendItem } from "../../pages/all-friends/AllFriendsPage";
import { EmptyState } from "../empty-state/EmptyState";
import { Link } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";
import styles from "../list-group/ListGroup.module.scss";
import axios from "axios";

interface FriendsListProps {
  userId: number | null;
}

export const FriendsList = ({ userId }: FriendsListProps) => {
  const { userId: sessionUserId } = useUserContext();
  const [ friendsData, setFriendsData ] = useState<FriendItem[]>([]);
  const showViewAllBtn = sessionUserId === userId;

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
            return { ...friend, username:username};
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
  }, [userId]);
  
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
