import {NavLink} from "react-router-dom";
import {LuLayoutDashboard,LuBookOpen,LuClipboardList} from "react-icons/lu";

import logo from "../assets/logo-edumentor.svg";

function Sidebar({ onClose }){

  const menus=[
    {
      name:"Dashboard",
      path:"/dashboard",
      icon:LuLayoutDashboard
    },
    {
      name:"Materi",
      path:"/materials",
      icon:LuBookOpen
    },
    {
      name:"Quiz History",
      path:"/quiz-history",
      icon:LuClipboardList
    }
  ];

  return(
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shrink-0">

      {/* Brand */}
      <div className="h-16 flex items-center justify-center gap-3 px-6">
        <img src={logo} alt="EduMentor AI Logo" className="w-9 h-9 object-contain" />
        <span className="text-lg font-bold tracking-tight text-foreground">
          EduMentor AI
        </span>
      </div>

      {/* Menu Label */}
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-6 mt-4 mb-3">
        Menu
      </div>

      {/* Navigation */}
      <ul className="space-y-1 px-3 flex-1">

        {menus.map(menu=>{
          const Icon=menu.icon;
          return(
            <li key={menu.path}>

              <NavLink
                to={menu.path}
                onClick={onClose}
                className={({isActive})=>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={20} strokeWidth={2.5}/>
                <span>{menu.name}</span>
              </NavLink>

            </li>
          );
        })}

      </ul>

    </aside>
  );
}

export default Sidebar;