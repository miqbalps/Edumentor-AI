import {useNavigate} from "react-router-dom";
import {LuLogOut,LuMenu} from "react-icons/lu";

function Navbar({ onToggleSidebar }){

  const navigate=useNavigate();

  const user=
    JSON.parse(
      localStorage.getItem("user")||
      "{}"
    );

  const handleLogout=()=>{

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return(
    <nav className="h-16 bg-white flex items-center justify-between px-4 md:px-8 shrink-0 border-b border-muted">

      {/* Hamburger menu on mobile */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-md hover:bg-gray-100 md:hidden text-gray-600 transition-colors cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        <LuMenu size={24} />
      </button>

      <div className="flex items-center gap-4 ml-auto">

        <div className="bg-muted rounded-md px-4 py-2">
          <span className="text-sm font-medium text-gray-600">
            {user.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:scale-105 hover:bg-red-700 cursor-pointer"
        >
          <LuLogOut size={16} strokeWidth={2.5}/>
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;