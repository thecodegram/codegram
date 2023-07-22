import { Link } from "react-router-dom"
import { Avatar, AvatarSize } from "./Avatar"
import { IconVerifiedBadge } from "../icons"

import styles from "./UserInfoHeader.module.scss"

export enum UserInfoHeaderVariant {
  default = "default",
  column = "column",
  row = "row"
}

interface UserInfoHeaderProps {
  username: string,
  name: string,
  variant?: UserInfoHeaderVariant
  avatarSize?: AvatarSize
}

export const UserInfoHeader = ({ 
  username, 
  name, 
  variant=UserInfoHeaderVariant.default, 
  avatarSize=AvatarSize.regular }: UserInfoHeaderProps) => 
{
  
  return (
    <article className={`${styles.profileInfoHeader} ${styles[variant]}`}>
      <Link to={`/${username}`} relative='path'>
        <Avatar username={username} size={avatarSize} /> 
        <div className={styles.userInfo}>
          <h2>{name}</h2>
          <IconVerifiedBadge />
          <p>@{username}</p>
        </div>
      </Link>
    </article>
  )
}