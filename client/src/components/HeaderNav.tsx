import { IconInbox } from '../icons';
import { useUserContext } from './UserContext';
import axios from "axios"
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Dropdown } from './Dropdown';
import { useEffect, useState } from 'react';

import styles from "./HeaderNav.module.scss"

export const HeaderNav = () => {
  const { username, userId } = useUserContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([])

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, { withCredentials: true });
  
      if (response.status === 200) {
        Cookies.remove('mysession'); // replace 'cookie-name' with the name of the cookie you want to delete
        // Redirect the user to the login page
        navigate('/login');
      } else {
        console.error('Error logging out: Invalid response status');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/notifications`, 
          { withCredentials: true, }
        )

        setNotifications(response.data)
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    // const interval = setInterval(async () => {
    //   try {
    //     const response = await axios.get(
    //       `${process.env.REACT_APP_API_URL}/api/user/${username}/profilePicture`,
    //       {
    //         responseType: "blob",
    //         withCredentials: true,
    //       }
    //     );
    //     // creates a local URL for the Blob
    //     const profilePicURL = URL.createObjectURL(response.data); 
    //     setProfilePic(profilePicURL);
    //   } catch (error) {
    //     console.error("Error fetching profile picture:", error);
    //   }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [username, userId]);

  return (<header className={styles.header}>
    <section className={styles.left}><h1><Link to="/dashboard" relative='path'>Codegram</Link></h1></section>
    <section className={styles.right}>
      <Dropdown trigger={<IconInbox />}>
        <article className={styles.dropdown}>
          <h2>Notifications</h2>
          {notifications.length > 0 &&<section className={styles.dropdownList}>
            {notifications.map(({message, created_at}, index) => 
              <div key={index} className={styles.dropdownItem}>
                <p className={styles.message}>{message}</p>
                <p className={styles.timestamp}>{new Date(created_at).toDateString()}</p>
              </div>
            )}
          </section>}
        </article>
      </Dropdown>
      <Link to={`/${username}`} relative='path'>
        <Avatar username={username || ""} />
      </Link>
      <button className={styles.btnText} onClick={handleLogout}>Logout</button>
    </section>
  </header>)
}