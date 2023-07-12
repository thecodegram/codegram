import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { IconInbox, IconFollowBtnPlus, IconVerifiedBadge, IconLikeBtnHeart } from '../icons';

import styles from "./DashboardPage.module.scss"

interface leetcodeData {
  usename?: String,
  submitStats: {
    acSubmissionNum: {
      difficulty: String,
      count: Number,
      submissions: Number
    }[]
  }
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

const DashboardPage = () => {
  const [data, setData] = useState<leetcodeData>(
    {
      submitStats: {
      acSubmissionNum: []
  }});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/trigger-requests/leetcode/dannyliu0421',{
        withCredentials: true,
      });
      const jsonData = await response.data;
      setData(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    
    <div>
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
            </section>
          </header>
          <main className={styles.main}>
            <article className={styles.feed}>
              {feedItemDummyData.map(f => <FeedItem {...f} />)}
            </article>
            <article className={styles.relationships}></article>
          </main>
        {/* <ul>
          {data.submitStats.acSubmissionNum.map((item) => (
            <li>{item.difficulty} {item.count.toString()}</li>
          ))}
        </ul> */}
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

export default DashboardPage;
