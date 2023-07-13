import axios from 'axios';
import { useState, useEffect } from 'react';

import { IconInbox, IconFollowBtnPlus, IconVerifiedBadge, IconLikeBtnHeart } from '../icons';
import styles from "./DashboardPage.module.scss"
import { useNavigate } from 'react-router-dom';


interface leetcodeData {
  usename?: string;
  submitStats?: {
    acSubmissionNum: {
      difficulty: string;
      count: number;
      submissions: number;
    }[];
  };
}

const feedItemDummyData: FeedItemProps[] = [
  {
    name: "Peyz",
    username: "peyz",
    body: "PeyZ just solved Threesum on Leetcode!",
    numOfLikes: 12,
    createdTime: new Date()
  },
  {
    name: "George",
    username: "shaygeko",
    body: "George just solved a hard question on Leetcode!",
    numOfLikes: 24,
    createdTime: new Date()
  },
  {
    name: "Danny",
    username: "dannyl1u",
    body: "Danny just solved a hard question on Leetcode!",
    numOfLikes: 12,
    createdTime: new Date()
  },
]

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
  const [data, setData] = useState<leetcodeData>({
    submitStats: {
      acSubmissionNum: [],
    },
  });
  const [loading, setLoading] = useState(true);
  // const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/trigger-requests/leetcode/dannyliu0421`,
        {
          withCredentials: true,
        }
      );
      const jsonData = await response.data;

      setData(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Perform logout request using axios or your preferred method
      // For example:
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      // Redirect the user to the login page
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
          <header className={styles.header}>
            <section className={styles.left}><h1>Codegram</h1></section>
            <section className={styles.right}>
              <IconInbox />
              <article className={styles.avatar}>
                U
              </article>
              <button className={styles.btnText} onClick={handleLogout}>Logout</button>
            </section>
          </header>
          <main className={styles.main}>
            <article className={styles.stats}>
              <div className={styles.avatar}>U</div>
              <div className={styles.userInfo}>
                <h2>Usertest</h2>
                <IconVerifiedBadge />
                <p>@usertest</p>
              </div>
              <div className={styles.statsGrid}>
                {data && data?.submitStats?.acSubmissionNum.map((item) => (
                  <div>
                    <p>{item.count.toString()}</p>
                    <h3>{item.difficulty}</h3>
                  </div>
                ))}
              </div>
            </article>
            <article className={styles.feed}>
              {feedItemDummyData.map((f, index) => <FeedItem key={index} {...f} />)}
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
      <div className={styles.avatar}>{name[0]}</div>
      <h3>{name}</h3>
      <IconVerifiedBadge />
      <p className={styles.detailText}>@{username}</p>
      <div className={styles.dot}></div>
      <p className={styles.detailText}>3 mins ago</p>
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
          <div className={styles.avatar}>{name[0]}</div>
          <div className={styles.info}>
            <h3>{name}</h3>
            <IconVerifiedBadge />
            <p>@{handle}</p>
          </div>
        </li>
      )}
    </ul>
  </article>
}

export default DashboardPage;