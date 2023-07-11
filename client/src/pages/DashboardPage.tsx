import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface leetcodeData {
  usename?: string;
  submitStats: {
    acSubmissionNum: {
      difficulty: string;
      count: number;
      submissions: number;
    }[];
  };
}

const DashboardPage = () => {
  const [data, setData] = useState<leetcodeData>({
    submitStats: {
      acSubmissionNum: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/trigger-requests/dannyliu0421`,
        {
          withCredentials: true,
        });
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

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <ul>
            {data.submitStats.acSubmissionNum.map((item, index) => (
              <li key={index}>
                {item.difficulty} {item.count.toString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
