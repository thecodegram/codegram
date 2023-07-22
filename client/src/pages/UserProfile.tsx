import { useParams } from "react-router-dom"
import { HeaderNav } from "../components/HeaderNav"
import { UserInfoHeader } from "../components/UserInfoHeader"
import { AvatarSize } from "../components/Avatar"
import { UserStatsGrid } from "../components/UserStatsGrid"
import { ListGroup } from "../components/ListGroup"
import { friendsDummyData, groupsDummyData } from "./DashboardPage"
import { IconRankingMovedUp } from "../icons"

import styles from "./UserProfile.module.scss"

export const UserProfilePage = () => {
  const { username } = useParams()
  // useEffect(async () => {

  // }, )


  return(
    <>
      <HeaderNav />
      <div className={styles.userProfilePage}>
        <header>
          <UserInfoHeader 
            username={username || ""} 
            name={username || ""}
            avatarSize={AvatarSize.large}
            />
          <article className={styles.rankTag}>
            #12
            <span><IconRankingMovedUp />2</span>
          </article>
        </header>
        <main className={styles.main}>
          {username && <UserStatsGrid username={username} />}
          <article className={styles.relationships}>
            <ListGroup title='Friends'>
              {friendsDummyData.map(({name, handle}, index) => (
                <li key={index}>
                  <UserInfoHeader 
                    username={name} 
                    name={handle} 
                  />
                </li>
              ))}
            </ListGroup>
            <ListGroup title='Groups'>
              {groupsDummyData.map(({name, handle}, index) => (
                <li key={index}>
                  <UserInfoHeader 
                    username={name} 
                    name={handle} 
                  />
                </li>
              ))}
            </ListGroup>
          </article>
        </main>
      </div>
    </>
  )
}