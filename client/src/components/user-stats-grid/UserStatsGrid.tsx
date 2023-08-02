import { useEffect, useState } from "react"
import { UserInfoData } from "../../pages/dashboard/DashboardPage"
import { EmptyState } from "../empty-state/EmptyState"
import axios from "axios"

import styles from "./UserStatsGrid.module.scss"

interface UserStatsGridProps {
  username: string
}

export const UserStatsGrid = ({ username }: UserStatsGridProps) => {
  const [statsData, setStatsData] = useState<UserInfoData>();

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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [username]);

  return !statsData
    ? <EmptyState>No stats yet</EmptyState>
    : <div className={styles.statsGrid}>
        <div className="leetcode">
          <h2>Leetcode</h2>
          <div className="grid">
            {statsData && statsData?.mongo.leetcode?.submitStats?.acSubmissionNum.map((item, index) => (
              <div key={index}>
                <p>{item.count.toString()}</p>
                <h3>{item.difficulty}</h3>
              </div>
            ))}
          </div>
        </div>
        {(statsData?.postgres.score && statsData?.mongo.leetcode?.submitStats?.acSubmissionNum[0].count) &&
        <div className="vjudge">
          <h2>Vjudge</h2>
          <div>
            <p>{statsData?.postgres.score - statsData?.mongo.leetcode?.submitStats?.acSubmissionNum[0].count}</p>
          </div>
        </div>}
    </div>
}