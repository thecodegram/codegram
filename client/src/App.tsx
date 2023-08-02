import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import PrivateRoute from "./routes/PrivateRoute";
import OnBoardingPage from "./pages/onboarding/OnBoardingPage";
import { UserProfilePage } from "./pages/user-profile/UserProfile";
import { FriendsPage } from "./pages/friends/FriendsPage";
import { FriendRequestsPage } from "./pages/friend-requests/FriendRequestsPage";
import { AllFriendsPage } from "./pages/all-friends/AllFriendsPage";
import { UserContext } from "./contexts/UserContext";
import { GroupProfilePage } from "./pages/group-profile/GroupProfile";
import { GroupProfileMembers } from "./pages/group-members/GroupMembers";
import { GroupsPage } from "./pages/groups/GroupsPage";
import { GroupInvitesPage } from "./pages/group-invites/GroupInvitesPage";
import { AllGroupsPage } from "./pages/all-groups/AllGroupsPage";
import { ImageCacheProvider } from "./components/image-cache-context/ImageCacheContext";
import { GroupProfileActivity } from "./pages/group-activity/GroupActivity";
import { gapi } from "gapi-script";

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: "967455002287-6ck3jmsbapm0jfj0h46k5cc5ha2kg414.apps.googleusercontent.com",
        scope: "",
      })
    }
    gapi.load("client:auth2", start);
  }, []);

  return (
    <Router>
      <div className="App">
        <UserContext.Provider
          value={{ username, userId, setUsername, setUserId }}
        >
          <ImageCacheProvider>
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
              path="/groups/*"
              element={
                <PrivateRoute>
                  <GroupsPage />
                </PrivateRoute>
              }
            >
              <Route
                path=""
                element={<AllGroupsPage />}
              />
              <Route
                path="invites"
                element={<GroupInvitesPage />}
              />
            </Route>
            <Route
              path="/u/:username"
              element={
                <PrivateRoute>
                  <UserProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/g/:groupId/*"
              element={
                <PrivateRoute>
                  <GroupProfilePage />
                </PrivateRoute>
              }
            >
              <Route
                path=""
                element={<GroupProfileActivity />}
              />
              <Route
                path="members"
                element={<GroupProfileMembers />}
              />
            </Route>
            <Route
              path="/friends/*"
              element={
                <PrivateRoute>
                  <FriendsPage />
                </PrivateRoute>
              }
            >
              <Route path="" element={<AllFriendsPage />} />
              <Route path="requests" element={<FriendRequestsPage />} />
            </Route>
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
        </ImageCacheProvider>
      </UserContext.Provider>
    </div>
  </Router>
)}

export default App;
