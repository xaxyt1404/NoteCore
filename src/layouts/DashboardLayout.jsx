import { useEffect, useState } from "react";
import "../styles/dashboard.css";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import CoreAIChat from "../components/dashboard/CoreAIChat";
import FloatingIcons from "../components/common/FloatingIcons";

const EMPTY_NAV = { main: [], bottom: [] };

export default function DashboardLayout({
  navigation = EMPTY_NAV,
  activeView,
  onNavigate,
  user,
  notifications = [],
  onOpenProfile,
  onLogout,
  chatGreeting,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("dashboard-body");
    return () => document.body.classList.remove("dashboard-body");
  }, []);

  const handleNavigate = (id) => {
    onNavigate?.(id);
    setSidebarOpen(false);
  };

  return (
    <>
      <div className="dashboard-container">
        <Sidebar
          navigation={navigation}
          activeView={activeView}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="dashboard-main">
          <Topbar
            user={user}
            notifications={notifications}
            sidebarOpen={sidebarOpen}
            onMenuToggle={() => setSidebarOpen(true)}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
          />
          <main className="dash-viewport">{children}</main>
        </div>
      </div>

      <CoreAIChat greeting={chatGreeting} />
      <FloatingIcons />
    </>
  );
}