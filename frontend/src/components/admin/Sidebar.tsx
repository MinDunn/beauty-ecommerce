import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { clsx } from "clsx";

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", name: "Bảng điều khiển", icon: LayoutDashboard },
    { path: "/admin/products", name: "Sản phẩm", icon: ShoppingBag },
    { path: "/admin/orders", name: "Đơn hàng", icon: ClipboardList },
    { path: "/admin/feedback", name: "Phản hồi", icon: MessageSquare },
  ];

  return (
    <div className="w-72 h-screen bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 hidden md:flex shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-primary-500 p-2 rounded-lg">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight uppercase select-none">Glowzy <span className="text-primary-500">Admin</span></h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary-500/10 text-primary-500" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={clsx(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-500" : "text-slate-400 group-hover:text-white"
              )} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(243,112,33,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>


      <div className="p-6">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1 font-medium italic">Hệ thống quản trị</p>
          <p className="text-sm text-white font-bold tracking-wide">Version 2.0 Premium</p>
        </div>
      </div>
    </div>
  );
};