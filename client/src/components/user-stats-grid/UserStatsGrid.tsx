import { useEffect, useState } from "react"
import axios from "axios"

import styles from "./UserStatsGrid.module.scss"

interface StatsData {
  total: number,
  leetcode: {
    all: number,
    easy: number,
    medium: number,
    hard: number,
  },
  vjudge: number
}

interface LeetcodeData {
  difficulty: string, 
  count: number,
}
interface UserStatsGridProps {
  username: string
}

export const UserStatsGrid = ({ username }: UserStatsGridProps) => {
  const [statsData, setStatsData] = useState<StatsData>({
    total: 0,
    leetcode: {
      all: 0,
      easy: 0,
      medium: 0,
      hard: 0
    },
    vjudge: 0
  });

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

        var newData = {...statsData}
        newData.total = jsonData.postgres.score
        if (jsonData?.mongo?.leetcode?.submitStats?.acSubmissionNum) {
          newData.vjudge = jsonData.postgres.score - jsonData?.mongo?.leetcode?.submitStats?.acSubmissionNum[0].count

          jsonData?.mongo?.leetcode?.submitStats?.acSubmissionNum.forEach(
            ({difficulty, count}: LeetcodeData) => {
              if (difficulty === 'All') {
                newData.leetcode.all = count
              } else if (difficulty === 'Easy') {
                newData.leetcode.easy = count
              } else if (difficulty === 'Medium') {
                newData.leetcode.medium = count
              } else if (difficulty === 'Hard') {
                newData.leetcode.hard = count
              }
            })
        }

        setStatsData(newData)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // console.log("fetching data");
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (<div className={styles.statsGrid}>
        <div className={styles.card}>
          <p>{statsData.total || 0}</p>
          <h3>Total solved</h3>
        </div>
        <div className={styles.leetcode}>
          <h2>Leetcode</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <p>{statsData?.leetcode?.all || 0}</p>
              <h3>All</h3>
            </div>
            <div className={styles.card}>
              <p>{statsData?.leetcode?.easy || 0}</p>
              <h3>Easy</h3>
            </div>
            <div className={styles.card}>
              <p>{statsData?.leetcode?.medium || 0}</p>
              <h3>Medium</h3>
            </div>
            <div className={styles.card}>
              <p>{statsData?.leetcode?.hard || 0}</p>
              <h3>Hard</h3>
            </div>
          </div>
        </div>
        <div className={styles.vjudge}>
          <h2>Vjudge</h2>
          <div className={styles.card}> 
            <p>{statsData?.vjudge || 0}</p>
            <h3>Total solved</h3>
          </div>
        </div>
    </div>)
}