import axios from 'axios';
import { useState, useEffect } from 'react';
import { useUserContext } from '../components/UserContext';
import { IconFollowBtnPlus, IconLikeBtnHeart } from '../icons';
import { HeaderNav } from '../components/HeaderNav';
import { UserInfoHeader, UserInfoHeaderVariant } from '../components/UserInfoHeader';
import { AvatarSize } from '../components/Avatar';

import styles from "./DashboardPage.module.scss"

export interface leetcodeData {
  username?: string;
  leetcode: {
    submitStats?: {
      acSubmissionNum: {
        difficulty: string;
        count: number;
        submissions: number;
      }[];
    }
  },
}

interface feedData {
  "title": string,
  "titleSlug": string,
  "timestamp": string,
  "statusDisplay": string,
  "lang": string,
  "__typename": string
}

const friendsDummyData: RelationshipProps[] = [
  {
    name: "Peyz",
    handle: "peyz"
  },
  {
    name: "Danny",
    handle: "dannyl1u"
  },
  {
    name: "George",
    handle: "shaygeko"
  },
  {
    name: "Bobby",
    handle: "bobbychan"
  },
]

const groupsDummyData: RelationshipProps[] = [
  {
    name: "372 Group",
    handle: "372group"
  },
  {
    name: "Bobby's Class",
    handle: "bobbychan372"
  },
  {
    name: "SFU Competitive Programming club",
    handle: "sfucpc"
  },
]

const DashboardPage = () => {
  const [statsData, setStatsData] = useState<leetcodeData>({
    leetcode: {
      submitStats: {
        acSubmissionNum: []
      }
    }
  });
  const [feedData, setFeedData] = useState<feedData[]>([])
  const [loading, setLoading] = useState(true);
  const { username } = useUserContext();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${username}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setStatsData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [username]);

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
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [username]);

  

  // const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setUsername(event.target.value);
  // };

  // const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   fetchData();
  // };

  return (
    <div>
      {/* <form onSubmit={handleFormSubmit}>
      <button onClick={handleLogout}>Logout</button>
        <input type="text" value={username} onChange={handleUsernameChange} placeholder="Enter LeetCode username" />
        <button type="submit">Check stats</button>
      </form> */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <HeaderNav />
          <main className={styles.main}>
            <article className={styles.stats}>
              <UserInfoHeader 
                username={username || ""} 
                name={username || ""} 
                variant={UserInfoHeaderVariant.column} 
                avatarSize={AvatarSize.medium}
              />
              <div className={styles.statsGrid}>
                {statsData && statsData?.leetcode.submitStats?.acSubmissionNum.map((item) => (
                  <div>
                    <p>{item.count.toString()}</p>
                    <h3>{item.difficulty}</h3>
                  </div>
                ))}
              </div>
            </article>
            <article className={styles.feed}>
              {feedData && feedData.map(({title, timestamp}, index) => 
                <FeedItem 
                  key={index}
                  name={username || ""}
                  username={username || ""}
                  body={`${username} just solved ${title} on LeetCode!`} 
                  numOfLikes={Math.floor(Math.random() * 20) + 1}
                  createdTime={new Date(+timestamp * 1000)}
                />)
              }
            </article>
            <article className={styles.relationships}>
              <RelationshipList title='Friends' relationships={friendsDummyData} />
              <RelationshipList title='Groups' relationships={groupsDummyData} />
            </article>
          </main>
        </>
      )}
    </div>
  );
};

interface FeedItemProps {
  name: string,
  username: string,
  body: string,
  numOfLikes: number,
  createdTime: Date
}

const FeedItem = ({name, username, body, numOfLikes, createdTime}: FeedItemProps) => {

  return <article className={styles.feedItem}>
    <section className={styles.header}>
      <UserInfoHeader 
        username={username} 
        name={username} 
        variant={UserInfoHeaderVariant.row}
      />
      <div className={styles.dot}></div>
      <p className={styles.detailText}>{createdTime.toDateString()}</p>
      <button><IconFollowBtnPlus />Follow</button>
    </section>
    <section className={styles.body}>
      <p>{body}</p>
    </section>
    <section className={styles.footer}>
      <button><IconLikeBtnHeart />{numOfLikes}</button>
    </section>
  </article>
}

interface RelationshipProps {
  name: string,
  handle: string
}

interface RelationshipListProps {
  title: string,
  relationships: RelationshipProps[]
}

const RelationshipList = ({ title, relationships }: RelationshipListProps) => {
  return <article className={styles.relationshipList}>
    <h2>{title}</h2>
    <ul className={styles.list}>
      {relationships.map(({name, handle}, index) => 
        <li key={index}>
          <UserInfoHeader 
            username={name} 
            name={handle} 
          />
        </li>
      )}
    </ul>
  </article>
}

export default DashboardPage;