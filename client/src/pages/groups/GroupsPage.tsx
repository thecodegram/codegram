import { HeaderNav } from "../../components/header-nav/HeaderNav"
import { useState } from "react"
import {
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";

import styles from "../friends/FriendsPage.module.scss"

enum GroupsPageTab {
  all = "All groups",
  invites = "Group invites",
}

export const GroupsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [ activeFeedTab, setActiveFeedTab ] = useState<GroupsPageTab>(() =>
    location.pathname === "/groups" ? GroupsPageTab.all : GroupsPageTab.invites)

  return <>
    <HeaderNav />
    <main className={styles.friendsPage}>
      <h1>Friends</h1>
      <nav>
        <button 
          className={activeFeedTab === GroupsPageTab.all ? styles.active : ''} 
          onClick={() => {
            setActiveFeedTab(GroupsPageTab.all)
            navigate("/groups")
          }}>
            {GroupsPageTab.all}
        </button>
        <button 
          className={activeFeedTab === GroupsPageTab.invites ? styles.active : ''} 
          onClick={() => {
            setActiveFeedTab(GroupsPageTab.invites)
            navigate("/groups/invites")
          }}>
            {GroupsPageTab.invites}
        </button>
      </nav>
      <Outlet />
    </main>
  </>
}