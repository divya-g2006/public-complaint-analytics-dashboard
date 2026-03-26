import { Route, Routes } from "react-router-dom";
import "./App.css";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SubmitComplaintPage from "./pages/SubmitComplaintPage.jsx";
import MyComplaintsPage from "./pages/MyComplaintsPage.jsx";
import AdminComplaintsPage from "./pages/AdminComplaintsPage.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import Map from "./pages/Map.jsx";
import AdminProfilePage from "./pages/AdminProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/submit"
        element={
          <ProtectedRoute>
            <Layout>
              <SubmitComplaintPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-complaints"
        element={
          <ProtectedRoute>
            <Layout>
              <MyComplaintsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminComplaintsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminAnalytics />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/map"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Map />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminComplaintsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
