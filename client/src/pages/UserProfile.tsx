import { useParams } from "react-router-dom"
import { UserInfoHeader } from "../components/UserInfoHeader"
import { AvatarSize } from "../components/Avatar"
import { UserStatsGrid } from "../components/UserStatsGrid"
import { ListGroup } from "../components/ListGroup"
import { groupsDummyData } from "./DashboardPage"
import { IconRankingMovedUp, IconAddFriendBtnPlus } from "../icons"
import { useState, useEffect } from "react"
import { feedData } from "./DashboardPage"
import { FeedItem } from "../components/FeedItem"
import { HeaderNav } from "../components/HeaderNav"
import { Button } from "../components/Button"
import { useUserContext } from "../components/UserContext"
import { UserInfoData } from "./DashboardPage"
import { FriendsList } from "../components/FriendsList"
import { EmptyState } from "../components/EmptyState"
import axios from "axios"

import styles from "./UserProfile.module.scss"

enum ActivityFeedTab {
  all = "all",
  leetcode = "leedcode",
  vjudge = "vjudge"
}

export const UserProfilePage = () => {
  const { username, userId } = useUserContext()
  const { username: profileUsername } = useParams()
  const [ activeFeedTab, setActiveFeedTab ] = useState<ActivityFeedTab>(ActivityFeedTab.all)
  const [ profileUserData, setProfileUserData ] = useState<UserInfoData>()
  const [feedData, setFeedData] = useState<feedData[]>([])
  const showAddFriendBtn = username !== profileUsername

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${profileUsername}/latestSubmits`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setFeedData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [profileUsername]);

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
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [profileUsername]);

  const onClickAddFriend = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/${userId}/send-friend-request/${profileUserData?.postgres.id}`, {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  }

  return(
    <>
      <HeaderNav />
      <div className={styles.userProfilePage}>
        <header>
          <UserInfoHeader 
            username={profileUsername || ""} 
            name={profileUsername || ""}
            avatarSize={AvatarSize.large}
            />
          <article className={styles.rankTag}>
            #12
            <span><IconRankingMovedUp />2</span>
          </article>
          {showAddFriendBtn && <Button onClick={onClickAddFriend}><IconAddFriendBtnPlus /> Add friend</Button>}
        </header>
        <main className={styles.main}>
          <article className={styles.statsGrid}>
            <h2>Stats</h2>
            {profileUsername && <UserStatsGrid username={profileUsername} />}
          </article>

          <article className={styles.relationships}>
            <FriendsList userId={profileUserData?.postgres.id || null} />
            <ListGroup title='Groups'>
              {groupsDummyData.map(({name, handle}, index) => (
                <li key={index}>
                  <UserInfoHeader 
                    username={name} 
                    name={handle} 
                  />
                </li>
              ))}
            </ListGroup>
          </article>

          <article className={styles.activityFeed}>
            <nav>
              <button 
                className={activeFeedTab === ActivityFeedTab.all ? styles.active : ''} 
                onClick={() => setActiveFeedTab(ActivityFeedTab.all)}>
                  All Activity
              </button>
              <button 
                className={activeFeedTab === ActivityFeedTab.leetcode ? styles.active : ''} 
                onClick={() => setActiveFeedTab(ActivityFeedTab.leetcode)}>
                  LeetCode
              </button>
              <button 
                className={activeFeedTab === ActivityFeedTab.vjudge ? styles.active : ''} 
                onClick={() => setActiveFeedTab(ActivityFeedTab.vjudge)}>
                  Vjudge
              </button>
            </nav>
            <section className={styles.feed}>
              {feedData.length === 0 
                ? <EmptyState>No activity yet</EmptyState>
                : feedData.map(({title, timestamp}, index) => 
                  <FeedItem 
                    key={index}
                    name={profileUsername || ""}
                    username={profileUsername || ""}
                    body={`${profileUsername} just solved ${title} on LeetCode!`} 
                    numOfLikes={Math.floor(Math.random() * 20) + 1}
                    createdTime={new Date(+timestamp * 1000)}
                    showFullInfo={false}
                  />
                )
              }
              
            </section>
          </article>
        </main>
      </div>
    </>
  )
}