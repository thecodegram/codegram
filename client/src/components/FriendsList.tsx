import { ListGroup } from "./ListGroup"
import { UserInfoHeader } from "./UserInfoHeader"
import { useState, useEffect } from "react"
import axios from "axios"

interface FriendsListProps {
  userId: number
}

interface FriendItem {
  user_1_id: number,
  user_2_id: number,
  user_1_username: string,
  user_2_username: string,
  created_at: string
}

export const FriendsList = ({ userId }: FriendsListProps) => {
  const [ friendsData, setFriendsData] = useState<FriendItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/${userId}/friends`,
          {
            withCredentials: true,
          }
        );
        const jsonData = await response.data;
  
        setFriendsData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  return <ListGroup title='Friends'>
  {friendsData.map(({ user_1_id, user_1_username, user_2_username }, index) => (
    <li key={index}>
      <UserInfoHeader 
        username={userId === user_1_id ? user_2_username : user_1_username} 
        name={userId === user_1_id ? user_2_username : user_1_username} 
      />
    </li>
  ))}
</ListGroup>
}