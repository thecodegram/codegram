import styles from "./Avatar.module.scss"

export enum AvatarSize {
  regular= "size-regular",
  large="size-large",
  medium="size-medium"
}

interface AvatarProps {
  username: string
  size?: AvatarSize
}

export const Avatar = ({ username, size = AvatarSize.regular }: AvatarProps) => {
  return <div className={`${styles.avatar} ${styles[size]}`}>{username && username[0].toUpperCase()}</div>
}