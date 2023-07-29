import { IconInbox } from '../icons';
import { useUserContext } from './UserContext';
import axios from "axios"
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Dropdown } from './Dropdown';
import { useState } from 'react';
import { EmptyState } from './EmptyState';

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

  const onClickShowNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/${userId}/notifications`, 
        { withCredentials: true, }
      )

      setNotifications(response.data)
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  return (<header className={styles.header}>
    <section className={styles.left}><h1><Link to="/dashboard" relative='path'>Codegram</Link></h1></section>
    <section className={styles.right}>
      <Dropdown trigger={<IconInbox />} triggerAction={onClickShowNotifications}>
        <article className={styles.dropdown}>
          <h2>Notifications</h2>
          {notifications.length === 0 
            ? <EmptyState>All caught up!</EmptyState>
            : <section className={styles.dropdownList}>
                {notifications.map(({ message, created_at, type }, index) => 
                  <div key={index} className={styles.dropdownItem}>
                    <Link to={type === "friend" ? `/friends/requests` : "/dashboard"} relative='path'>
                      <p className={styles.message}>{message}</p>
                      <p className={styles.timestamp}>{new Date(created_at).toDateString()}</p>
                    </Link>
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