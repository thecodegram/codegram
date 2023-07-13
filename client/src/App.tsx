// App.tsx

import React, { useState } from "react";
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
import { UserContext } from "./components/UserContext";

function App() {
  const [username, setUsername] = useState<string | null>(null);

  return (
    <Router>
      <div className="App">
        <UserContext.Provider value={{ username, setUsername }}>
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
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
