import { useState } from "react";
import "./Layout.css";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="cad-layout">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="cad-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="cad-main">
          <div className="cad-container">{children}</div>
        </main>
      </div>
    </div>
  );
}

