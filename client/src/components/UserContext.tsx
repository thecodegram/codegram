import { createContext, useContext } from 'react';

type UserContextProps = {
  username: string | null;
  setUsername: (username: string | null) => void;
};

export const UserContext = createContext<UserContextProps>({
  username: null,
  setUsername: () => {},
});

export const useUserContext = () => useContext(UserContext);
