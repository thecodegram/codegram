import { UserInfoHeader, UserInfoHeaderVariant } from "./UserInfoHeader"
import { IconFollowBtnPlus, IconLikeBtnHeart } from "../icons"

import styles from "./FeedItem.module.scss"

interface FeedItemProps {
  name: string,
  username: string,
  body: string,
  numOfLikes: number,
  createdTime: Date
}

export const FeedItem = ({name, username, body, numOfLikes, createdTime}: FeedItemProps) => {
  return <article className={styles.feedItem}>
    <section className={styles.header}>
      <UserInfoHeader 
        username={username} 
        name={name} 
        variant={UserInfoHeaderVariant.row}
      />
      <div className={styles.dot}></div>
      <p className={styles.detailText}>{createdTime.toDateString()}</p>
      <button><IconFollowBtnPlus />Follow</button>
    </section>
    <section className={styles.body}>
      <p>{body}</p>
    </section>
    <section className={styles.footer}>
      <button><IconLikeBtnHeart />{numOfLikes}</button>
    </section>
  </article>
}