// App.tsx

import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import OnBoardingPage from "./pages/OnBoardingPage";
import { UserProfilePage } from "./pages/UserProfile"
import { FriendsPage } from "./pages/FriendsPage";
import { UserContext } from "./components/UserContext";

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  return (
    <Router>
      <div className="App">
        <UserContext.Provider value={{ username, userId, setUsername, setUserId }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/onboarding"
              element={
                <PrivateRoute>
                  <OnBoardingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <PrivateRoute>
                  <FriendsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/:username"
              element={
                <PrivateRoute>
                  <UserProfilePage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
