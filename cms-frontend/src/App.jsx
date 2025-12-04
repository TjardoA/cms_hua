import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import Account from "./auth/Account";
import { AuthProvider } from "./auth/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import UserManagement from "./auth/UserManagement";
import CmsEdit from "./cms/CmsEdit";
import CmsPage from "./cms/CmsPage";

const router = createBrowserRouter(
  [
    { path: "/login", element: <Login /> },
    {
      path: "/cms",
      element: (
        <ProtectedRoute>
          <CmsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/cms/edit/:id",
      element: (
        <ProtectedRoute>
          <CmsEdit />
        </ProtectedRoute>
      ),
    },
    {
      path: "/account",
      element: (
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <ProtectedRoute requireRole="super">
          <UserManagement />
        </ProtectedRoute>
      ),
    },
    { path: "/", element: <Navigate to="/login" replace /> },
    { path: "*", element: <Navigate to="/login" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    </AuthProvider>
  );
}

export default App;
