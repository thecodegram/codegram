import { HeaderNav } from "../components/HeaderNav"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import { useUserContext } from "../components/UserContext"
import { ListGroup } from "../components/ListGroup"
import { Button, ButtonVariant } from "../components/Button"

import styles from "./FriendsPage.module.scss"

enum FriendsPageTab {
  all = "All Friends",
  requests = "Friend Requests",
}

interface FriendRequestItem {
  friend_request_id: number,
  requester_id: number,
  requestee_id: number,
  is_active: boolean,
  created_at: string,
  requester_username: string,
  requestee_username: string
}

export const FriendsPage = () => {
  const {  userId } = useUserContext()
  const [ searchParams, setSearchParams ] = useSearchParams();
  const [ activeFeedTab, setActiveFeedTab ] = useState<FriendsPageTab>(() =>
    searchParams.get("tab") === "requests" ? FriendsPageTab.requests : FriendsPageTab.all)
  const [ listData, setListData ] = useState<FriendRequestItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const requestSuffix = activeFeedTab === FriendsPageTab.all ? "friends" : "friend-requests"
      
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/${requestSuffix}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setListData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [activeFeedTab, userId]);

  return <>
    <HeaderNav />
    <main className={styles.friendsPage}>
      <h1>Friends</h1>
      <nav>
        <button 
          className={activeFeedTab === FriendsPageTab.all ? styles.active : ''} 
          onClick={() => {
            setActiveFeedTab(FriendsPageTab.all)
            setSearchParams({})
          }}>
            {FriendsPageTab.all}
        </button>
        <button 
          className={activeFeedTab === FriendsPageTab.requests ? styles.active : ''} 
          onClick={() => {
            setActiveFeedTab(FriendsPageTab.requests)
            setSearchParams({ tab: "requests" })
          }}>
            {FriendsPageTab.requests}
        </button>
      </nav>
      <ListGroup>
        {listData.map(({ requester_username, created_at }) => 
          <article className={styles.friendRequestListItem}>
            <div className={styles.userInfo}>
              <h3>@{requester_username}</h3>
              <p>Sent {new Date(created_at).toDateString()}</p>
            </div>
            <div className={styles.actions}>
              <Button variant={ButtonVariant.secondary}>Accept</Button>
              <Button variant={ButtonVariant.tetriary}>Remove</Button>
            </div>
          </article>
        )}
      </ListGroup>
    </main>
  </>
}