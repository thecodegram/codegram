import styles from "./Avatar.module.scss";

export enum AvatarSize {
  regular = "size-regular",
  large = "size-large",
  medium = "size-medium",
}

interface AvatarProps {
  username: string;
  size?: AvatarSize;
  profilePic?: string | null | undefined;
}

export const Avatar = ({
  username,
  size = AvatarSize.regular,
  profilePic,
}: AvatarProps) => {
  const style = profilePic && profilePic.length > 0
    ? { backgroundImage: `url(${profilePic})`, backgroundSize: "cover" }
    : {};

  return (
    <div className={`${styles.avatar} ${styles[size]}`} style={style}>
      {(profilePic === null || profilePic === undefined || profilePic.length === 0) && username && username[0].toUpperCase()}
    </div>
  );
};
