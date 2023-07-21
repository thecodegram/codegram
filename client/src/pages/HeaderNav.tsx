import { IconInbox } from '../icons';
import { useUserContext } from '../components/UserContext';
import axios from "axios"
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';

import styles from "./HeaderNav.module.scss"

export const HeaderNav = () => {
  const { username } = useUserContext();
  const navigate = useNavigate();

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

  return (<header className={styles.header}>
    <section className={styles.left}><h1>Codegram</h1></section>
    <section className={styles.right}>
      <IconInbox />
      <article className={styles.avatar}>
        <Link to={`/${username}`} relative='path'>
          {username && username[0].toUpperCase()}
        </Link>
      </article>
      <button className={styles.btnText} onClick={handleLogout}>Logout</button>
    </section>
  </header>)
}