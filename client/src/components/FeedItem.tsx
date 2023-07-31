import { UserInfoHeader, UserInfoHeaderVariant } from "./UserInfoHeader"
import { IconLikeBtnHeart } from "../icons"

import styles from "./FeedItem.module.scss"

interface FeedItemProps {
  name: string,
  username: string,
  platform: string,
  problemTitle: string,
  problemTitleSlug: string,
  numOfLikes: number,
  createdTime: Date,
  showFullInfo?: boolean
}

const prettifyPlatform = (platform: string) => {
  if(platform === 'leetcode') return 'LeetCode';
  else return 'VJudge';
}

const getLink = (problemTitleSlug: string, platform: string) => {
  if(platform === 'leetcode') {
    return `https://leetcode.com/problems/${problemTitleSlug}/`;
  }
  else if(platform === 'vjudge') {
    return `https://vjudge.net/problem/${problemTitleSlug}`;
  }
  else {
    console.error("Problem platform not recognized!");
  }
}
export const FeedItem = ({ 
  name, username, platform, problemTitle, problemTitleSlug, numOfLikes, createdTime, showFullInfo=true
 }: FeedItemProps) => {
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
      <p>
      {`${username} solved `}
        <a href={getLink(problemTitleSlug, platform)} target="_blank" rel="noreferrer">
          {`${problemTitle}`}
        </a>
        {` on ${prettifyPlatform(platform)}!`}
      </p>
    </section>
    <section className={styles.footer}>
      <button><IconLikeBtnHeart />{numOfLikes}</button>
    </section>
  </article>
}