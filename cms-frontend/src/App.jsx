import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Account from "./auth/Account";
import { AuthProvider } from "./auth/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import UserManagement from "./auth/UserManagement";
import { CmsDataProvider } from "./cms/CmsDataContext";
import CmsEdit from "./cms/CmsEdit";
import CmsPage from "./cms/CmsPage";

function App() {
  return (
    <AuthProvider>
      <CmsDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/cms"
              element={
                <ProtectedRoute>
                  <CmsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cms/edit/:id"
              element={
                <ProtectedRoute>
                  <CmsEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireRole="super">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CmsDataProvider>
    </AuthProvider>
  );
}

export default App;
