import { IconInbox } from "../../icons";
import { useUserContext } from "../../contexts/UserContext";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import { Avatar } from "../avatar/Avatar";
import { Dropdown } from "../dropdown/Dropdown";
import { useEffect, useState } from "react";
import { EmptyState } from "../empty-state/EmptyState";
import { Button, ButtonVariant } from "../button/Button";
import { Modal } from "../modal/Modal";
import { useImageCache } from "../image-cache-context/ImageCacheContext";

import styles from "./HeaderNav.module.scss";
import { gapi } from "gapi-script";

export const HeaderNav = () => {
  const { username, userId } = useUserContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] =
    useState<boolean>(false);
  const { clearCache, cache } = useImageCache();

  useEffect(() => {
    if (username && cache[username] !== undefined && !profilePic) {
      setProfilePic(cache[username].imageData);
    }
  }, [username, cache, profilePic]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        Cookies.remove("mysession");
        clearCache();
        
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(() => {
          console.log('User signed out of Google session');
        });

        navigate("/login");
      } else {
        console.error("Error logging out: Invalid response status");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const onClickCreateGroup = async (value: string) => {
    const newGroup = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/group`,
      { name: value },
      { withCredentials: true }
    );

    navigate(`/g/${newGroup.data.group_id}`);
  };

  const onClickShowNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/${userId}/notifications`,
        { withCredentials: true }
      );

      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <section className={styles.left}>
          <h1>
            <Link to="/dashboard" relative="path">
              Codegram
            </Link>
          </h1>
        </section>
        <section className={styles.right}>
          <Dropdown
            trigger={<IconInbox />}
            triggerAction={onClickShowNotifications}
          >
            <article className={styles.dropdown}>
              <h2>Notifications</h2>
              {notifications.length === 0 ? (
                <EmptyState>All caught up!</EmptyState>
              ) : (
                <section className={styles.dropdownList}>
                  {notifications.map(({ message, created_at, type }, index) => (
                    <div key={index} className={styles.dropdownItem}>
                      <Link
                        to={
                          type === "friend"
                            ? `/friends/requests`
                            : "/groups/invites"
                        }
                        relative="path"
                      >
                        <p className={styles.message}>{message}</p>
                        <p className={styles.timestamp}>
                          {new Date(created_at).toDateString()}
                        </p>
                      </Link>
                    </div>
                  ))}
                </section>
              )}
            </article>
          </Dropdown>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => setShowCreateGroupModal(true)}
          >
            Create a group
          </Button>
          <Link to={`/u/${username}`} relative="path">
            <Avatar
              username={username || ""}
              profilePic={profilePic}
            />
          </Link>
          <button className={styles.btnText} onClick={handleLogout}>
            Logout
          </button>
        </section>
      </header>
      {showCreateGroupModal && (
        <Modal
          title="Create a group"
          inputLabel="Group name"
          inputPlaceholder="Enter a group name"
          submitBtnLabel="Create group"
          onClickClose={() => setShowCreateGroupModal(false)}
          onClickSubmit={onClickCreateGroup}
        />
      )}
    </>
  );
};
