import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
