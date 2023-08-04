import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../contexts/UserContext";

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { setUsername, setUserId } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/auth/check`, {
        withCredentials: true,
      })
      .then((response) => {
        setIsAuthenticated(response.status === 200);
        setUsername(response.data.username);
        setUserId(response.data.userId);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUsername(null);
      });
  }, [setUsername, setUserId]);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) return null;
  return isAuthenticated ? children : null;
};

export default PrivateRoute;
