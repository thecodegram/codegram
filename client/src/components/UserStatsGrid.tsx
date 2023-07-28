import { useEffect, useState } from "react"
import axios from "axios"
import { leetcodeData } from "../pages/DashboardPage"

import styles from "./UserStatsGrid.module.scss"

interface UserStatsGridProps {
  username: string
}

export const UserStatsGrid = ({ username }: UserStatsGridProps) => {
  const [statsData, setStatsData] = useState<leetcodeData>({
    leetcode: {
      submitStats: {
        acSubmissionNum: []
      }
    }
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
  
        setStatsData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [username]);

  return <div className={styles.statsGrid}>
  {statsData && statsData?.leetcode.submitStats?.acSubmissionNum.map((item, index) => (
    <div key={index}>
      <p>{item.count.toString()}</p>
      <h3>{item.difficulty}</h3>
    </div>
  ))}
</div>
}