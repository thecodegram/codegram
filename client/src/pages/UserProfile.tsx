import { useParams } from "react-router-dom"
import { HeaderNav } from "../components/HeaderNav"
import { UserInfoHeader } from "../components/UserInfoHeader"
import { AvatarSize } from "../components/Avatar"
import { UserStatsGrid } from "../components/UserStatsGrid"
import { ListGroup } from "../components/ListGroup"
import { friendsDummyData, groupsDummyData } from "./DashboardPage"
import { IconRankingMovedUp } from "../icons"
import { useState, useEffect } from "react"
import { feedData } from "./DashboardPage"
import { FeedItem } from "../components/FeedItem"
import axios from "axios"

import styles from "./UserProfile.module.scss"

enum ActivityFeedTab {
  all = "all",
  leetcode = "leedcode",
  vjudge = "vjudge"
}

export const UserProfilePage = () => {
  const { username } = useParams()
  const [ activeFeedTab, setActiveFeedTab ] = useState<ActivityFeedTab>(ActivityFeedTab.all)
  const [feedData, setFeedData] = useState<feedData[]>([])

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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [username]);


  return(
    <>
      <HeaderNav />
      <div className={styles.userProfilePage}>
        <header>
          <UserInfoHeader 
            username={username || ""} 
            name={username || ""}
            avatarSize={AvatarSize.large}
            />
          <article className={styles.rankTag}>
            #12
            <span><IconRankingMovedUp />2</span>
          </article>
        </header>
        <main className={styles.main}>
          <article className={styles.statsGrid}>
            <h2>Stats</h2>
            {username && <UserStatsGrid username={username} />}
          </article>

          <article className={styles.relationships}>
            <ListGroup title='Friends'>
              {friendsDummyData.map(({name, handle}, index) => (
                <li key={index}>
                  <UserInfoHeader 
                    username={name} 
                    name={handle} 
                  />
                </li>
              ))}
            </ListGroup>
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
              {feedData && feedData.map(({title, timestamp}, index) => 
                <FeedItem 
                  key={index}
                  name={username || ""}
                  username={username || ""}
                  body={`${username} just solved ${title} on LeetCode!`} 
                  numOfLikes={Math.floor(Math.random() * 20) + 1}
                  createdTime={new Date(+timestamp * 1000)}
                  showFullInfo={false}
                />
              )}
            </section>
          </article>
        </main>
      </div>
    </>
  )
}