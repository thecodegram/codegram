import { HeaderNav } from "../components/HeaderNav"
import { useState } from "react"
import {
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";

import styles from "./FriendsPage.module.scss"

enum FriendsPageTab {
  all = "All Friends",
  requests = "Friend Requests",
}
export const FriendsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [ activeFeedTab, setActiveFeedTab ] = useState<FriendsPageTab>(() =>
    location.pathname === "/friends" ? FriendsPageTab.all : FriendsPageTab.requests)

  return <>
    <HeaderNav />
    <main className={styles.friendsPage}>
      <h1>Friends</h1>
      <nav>
        <button 
          className={activeFeedTab === FriendsPageTab.all ? styles.active : ''} 
          onClick={() => {
            setActiveFeedTab(FriendsPageTab.all)
            navigate("/friends")
          }}>
            {FriendsPageTab.all}
        </button>
        <button 
          className={activeFeedTab === FriendsPageTab.requests ? styles.active : ''} 
          onClick={() => {
            setActiveFeedTab(FriendsPageTab.requests)
            navigate("/friends/requests")
          }}>
            {FriendsPageTab.requests}
        </button>
      </nav>
      <Outlet />
    </main>
  </>
}