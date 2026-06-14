import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, clearCredentials } from "./store/slices/authSlice";
import { useGetMeQuery } from "./store/services/authApi";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Hydrates Redux auth state from the existing session cookie on first load.
function AuthInitializer() {
  const dispatch = useDispatch();
  const { data: user, isError, isSuccess } = useGetMeQuery();

  useEffect(() => {
    if (isSuccess && user) dispatch(setCredentials(user));
    if (isError) dispatch(clearCredentials());
  }, [isSuccess, isError, user, dispatch]);

  return null;
}

export default function App() {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <AuthInitializer />

      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />
              ) : (
                <SignupPage />
              )
            }
          />

          {/* Protected — any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected — admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? user?.role === "admin"
                      ? "/admin"
                      : "/dashboard"
                    : "/login"
                }
                replace
              />
            }
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}