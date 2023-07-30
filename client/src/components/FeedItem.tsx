import { UserInfoHeader, UserInfoHeaderVariant } from "./UserInfoHeader"
import { IconLikeBtnHeart } from "../icons"

import styles from "./FeedItem.module.scss"

interface FeedItemProps {
  name: string,
  username: string,
  body: string,
  numOfLikes: number,
  createdTime: Date,
  showFullInfo?: boolean
}

export const FeedItem = ({ name, username, body, numOfLikes, createdTime, showFullInfo=true }: FeedItemProps) => {
  return <article className={styles.feedItem}>
    <section className={styles.header}>
      {showFullInfo && <UserInfoHeader 
        username={username} 
        name={name} 
        variant={UserInfoHeaderVariant.row}
      />}
      {showFullInfo && <div className={styles.dot}></div>}
      <p className={styles.detailText}>{createdTime.toDateString()}</p>
    </section>
    <section className={styles.body}>
      <p>{body}</p>
    </section>
    <section className={styles.footer}>
      <button><IconLikeBtnHeart />{numOfLikes}</button>
    </section>
  </article>
}