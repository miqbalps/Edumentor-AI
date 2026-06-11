import {useState} from "react";
import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout(){
  const [isSidebarOpen,setIsSidebarOpen]=useState(false);

  return(
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar — responsive slide-out drawer on mobile, static on desktop */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out md:flex`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Right column: Navbar + Content */}
      <div className="flex-1 flex flex-col min-h-0">

        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}/>

        <main className="flex-1 bg-page-bg flex flex-col min-h-0 overflow-hidden">
          <Outlet/>
        </main>

      </div>

    </div>
  );
}

export default MainLayout;