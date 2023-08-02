import { Link } from "react-router-dom";
import { Avatar, AvatarSize } from "../avatar/Avatar";
import { formatDateMonthDayYear } from "../../util/date"

import styles from "../user-info-header/UserInfoHeader.module.scss";

interface GroupInfoHeaderProps {
  groupName: string;
  createdAt: string;
  avatarSize?: AvatarSize;
  profilePic?: string | null;
}

export const GroupInfoHeader = ({
  groupName,
  createdAt,
  profilePic,
}: GroupInfoHeaderProps) => {
  return (
    <article className={`${styles.profileInfoHeader}`}>
      <Link to={`/g/${groupName}`} relative="path">
        <Avatar username={groupName} size={AvatarSize.large} />
        <div className={styles.userInfo}>
          <h2>{groupName}</h2>
          <p>Created {formatDateMonthDayYear(new Date(createdAt))}</p>
        </div>
      </Link>
    </article>
  );
};
