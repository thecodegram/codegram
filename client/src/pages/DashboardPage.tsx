import axios from 'axios';
import React, { useState, useEffect } from 'react';


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
        <ul>
          {data.submitStats.acSubmissionNum.map((item) => (
            <li>{item.difficulty} {item.count.toString()}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardPage;
