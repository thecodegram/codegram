import { createContext, useContext } from 'react';

type UserContextProps = {
  username: string | null;
  userId: number | null,
  setUsername: (username: string | null) => void;
  setUserId: (userId: number | null) => void;
};

export const UserContext = createContext<UserContextProps>({
  username: null,
  userId: null,
  setUsername: () => {},
  setUserId: () => {}
});

export const useUserContext = () => useContext(UserContext);
