// DashboardPage.tsx

import React, { FC } from 'react';
import { useUserContext } from '../components/UserContext';

const DashboardPage: FC = () => {
  const { username } = useUserContext();

  console.log(username); // 'testuser

  return (
    <div>
      <h1>Welcome {username}!</h1>
    </div>
  );
}


export default DashboardPage;
