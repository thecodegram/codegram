import { HeaderNav } from "../components/HeaderNav"
import { Button } from "../components/Button"
import { useParams } from "react-router-dom"
import { GroupInfoHeader } from "../components/GroupInfoHeader"
import { useState, useEffect } from "react"
import { IconAddBtnPlus } from "../icons"

import axios from "axios"

import styles from "./GroupProfile.module.scss"

enum GroupProfilePageTab {
  activity = "Activity",
  members = "Members"
}

interface GroupInfo {
  group_id: number,
  name: string,
  created_at: string
}

export const GroupProfilePage = () => {
  const { groupId } = useParams()
  const [ groupInfoData, setGroupInfoData ] = useState<GroupInfo>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/group/${groupId}`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setGroupInfoData (jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [groupId]);

  const onClickGoToMembersTab = () => console.log("hello")

  const onClickInviteMember = () => console.log("test")

  return <>
    <HeaderNav />
    {groupInfoData && <div className={styles.groupProfilePage}>
        <header>
          <GroupInfoHeader 
            groupName={groupInfoData.name}
            createdAt={groupInfoData.created_at}
            />
          <Button onClick={onClickInviteMember}><IconAddBtnPlus /> Invite Member</Button>
        </header>
        <nav className={styles.tabNav}>
          <button className={styles.active}>
            {GroupProfilePageTab.activity}
          </ button>
          <button onClick={onClickGoToMembersTab}>
            {GroupProfilePageTab.members}
          </button>
        </nav>
        {/* <main>
          
        </main> */}
      </div>
    }
  </>
}