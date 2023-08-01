import { useParams } from "react-router-dom";
import { UserInfoHeader } from "../components/UserInfoHeader";
import { AvatarSize } from "../components/Avatar";
import { UserStatsGrid } from "../components/UserStatsGrid";
import { IconRankingMovedUp, IconAddBtnPlus } from "../icons";
import { useState, useEffect } from "react";
import { feedData } from "./DashboardPage";
import { FeedItem } from "../components/FeedItem";
import { HeaderNav } from "../components/HeaderNav";
import { Button } from "../components/Button";
import { useUserContext } from "../components/UserContext";
import { UserInfoData } from "./DashboardPage";
import { FriendsList } from "../components/FriendsList";
import { EmptyState } from "../components/EmptyState";
import { GroupsList } from "../components/GroupsList";
import { useImageCache } from "../components/ImageCacheContext";
import axios from "axios";

import styles from "./UserProfile.module.scss";

enum ActivityFeedTab {
  all = "all",
  leetcode = "leetcode",
  vjudge = "vjudge",
}

interface ProfileFeedQuery {
  username: string | undefined;
  offset: number | undefined;
  limit: number | undefined;
  platform: number | undefined;
}

export const UserProfilePage = () => {
  const { username, userId } = useUserContext();
  const { username: profileUsername } = useParams();
  const { cache, setCache } = useImageCache();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [activeFeedTab, setActiveFeedTab] = useState<ActivityFeedTab>(
    ActivityFeedTab.all
  );
  const [profileUserData, setProfileUserData] = useState<UserInfoData>();
  const [feedData, setFeedData] = useState<feedData[]>([]);
  const [showAddFriendBtn, setShowAddFriendBtn] = useState<boolean>(false);
  const isSessionProfile = username === profileUsername;

  useEffect(() => {
    const fetchData = async () => {
      try {
        var platform;

        if (activeFeedTab === ActivityFeedTab.leetcode) {
          platform = 1;
        } else if (activeFeedTab === ActivityFeedTab.vjudge) {
          platform = 2;
        }

        const payload: ProfileFeedQuery = {
          username: profileUsername,
          platform: platform,
          offset: 0,
          limit: 15,
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/events`,
          {
            withCredentials: true,
            params: payload,
          }
        );
        const jsonData = await response.data;

        setFeedData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [profileUsername, activeFeedTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${profileUsername}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;

        setProfileUserData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [profileUsername]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (profileUsername) {
        // this checks if username exists in cache and if  it exists, set profilePic to cached data and if not fetch data from API and then updates the cache
        const currentCache = cache[profileUsername];
        if (currentCache === undefined || currentCache === null) {
          try {
            console.log("Fetching profile picture I AM CALLED");
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/user/${profileUsername}/profilePicture`,
              {
                responseType: "blob",
                withCredentials: true,
              }
            );
            if (response.status !== 204) {
              const profilePicURL = URL.createObjectURL(response.data);

              setCache(profileUsername, profilePicURL);
              setProfilePic(profilePicURL);
            } else {
              setCache(profileUsername, "");
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
  }, [profileUsername, setCache]);
  /* eslint-disable react-hooks/exhaustive-deps */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/is-friend/${profileUserData?.postgres.id}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;

        setShowAddFriendBtn(!jsonData.is_friend);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userId && profileUserData && !isSessionProfile) {
      fetchData();
    }
  }, [userId, isSessionProfile, profileUserData]);

  const onClickAddFriend = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/${userId}/send-friend-request/${profileUserData?.postgres.id}`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <>
      <HeaderNav />
      <div className={styles.userProfilePage}>
        <header>
          <UserInfoHeader
            username={profileUsername || ""}
            name={profileUsername || ""}
            avatarSize={AvatarSize.large}
            profilePic={profilePic}
          />
          <article className={styles.rankTag}>
            #12
            <span>
              <IconRankingMovedUp />2
            </span>
          </article>
          {showAddFriendBtn && (
            <Button onClick={onClickAddFriend}>
              <IconAddBtnPlus /> Add friend
            </Button>
          )}
        </header>
        <main className={styles.main}>
          <article className={styles.statsGrid}>
            <h2>Stats</h2>
            {profileUsername && <UserStatsGrid username={profileUsername} />}
          </article>

          <article className={styles.relationships}>
            <FriendsList userId={profileUserData?.postgres.id || null} />
            <GroupsList userId={profileUserData?.postgres.id || null} />
          </article>

          <article className={styles.activityFeed}>
            <nav>
              <button
                className={
                  activeFeedTab === ActivityFeedTab.all ? styles.active : ""
                }
                onClick={() => setActiveFeedTab(ActivityFeedTab.all)}
              >
                All Activity
              </button>
              <button
                className={
                  activeFeedTab === ActivityFeedTab.leetcode
                    ? styles.active
                    : ""
                }
                onClick={() => setActiveFeedTab(ActivityFeedTab.leetcode)}
              >
                LeetCode
              </button>
              <button
                className={
                  activeFeedTab === ActivityFeedTab.vjudge ? styles.active : ""
                }
                onClick={() => setActiveFeedTab(ActivityFeedTab.vjudge)}
              >
                Vjudge
              </button>
            </nav>
            <section className={styles.feed}>
              {feedData.length === 0 ? (
                <EmptyState>No activity yet</EmptyState>
              ) : (
                feedData.map(
                  (
                    {
                      problemTitle,
                      problemTitleSlug,
                      timestamp,
                      username,
                      platform,
                      likes,
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
                    />
                  )
                )
              )}
            </section>
          </article>
        </main>
      </div>
    </>
  );
};
