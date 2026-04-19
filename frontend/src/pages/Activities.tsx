import { useState, useEffect } from "react";
import { adminService, type ActivityLog } from "../api/adminService";
import { Table } from "../components/admin/Table";
import { toast } from "react-hot-toast";
import { 
  Activity, 
  ShoppingCart, 
  User, 
  CreditCard, 
  LogIn, 
  Trash2, 
  RefreshCcw, 
  Shield, 
  Settings, 
  Globe,
  UserPlus,
  Unlock,
  Lock,
  Package,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const GROUPS = [
  { id: 'ALL', name: 'Tất cả', icon: Activity },
  { id: 'ACCOUNT', name: 'Tài khoản', icon: User },
  { id: 'SHOPPING', name: 'Mua sắm', icon: ShoppingCart },
  { id: 'SYSTEM', name: 'Hệ thống', icon: Settings },
];

export const Activities = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debouncing search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchActivities = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const groupParam = selectedGroup === 'ALL' ? undefined : selectedGroup;
      const response = await adminService.getRecentActivities(groupParam, debouncedQuery);
      setActivities(response);
    } catch (error) {
      toast.error("Không thể tải danh sách hoạt động");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedGroup, debouncedQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchActivities(false);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'REGISTER': return <UserPlus className="text-emerald-500" size={14} />;
      case 'LOGIN': 
      case 'LOGIN_GOOGLE': return <LogIn className="text-blue-500" size={14} />;
      case 'LOGOUT': return <LogIn className="text-slate-500 rotate-180" size={14} />;
      case 'CHANGE_PASSWORD':
      case 'RESET_PASSWORD': return <Shield className="text-indigo-500" size={14} />;
      case 'FORGOT_PASSWORD': return <HelpCircle className="text-amber-500" size={14} />;
      case 'UPDATE_PROFILE':
      case 'UPDATE_USER': return <User className="text-blue-400" size={14} />;
      case 'CREATE_USER': return <UserPlus className="text-emerald-400" size={14} />;
      case 'LOCK_USER': return <Lock className="text-rose-500" size={14} />;
      case 'UNLOCK_USER': return <Unlock className="text-emerald-500" size={14} />;
      
      case 'ADD_TO_CART': return <ShoppingCart className="text-emerald-500" size={14} />;
      case 'REMOVE_FROM_CART': return <Trash2 className="text-rose-500" size={14} />;
      case 'CLEAR_CART': return <Trash2 className="text-slate-500" size={14} />;
      case 'PLACE_ORDER': return <CreditCard className="text-primary-500" size={14} />;
      case 'CANCEL_ORDER_REQUEST': return <XCircle className="text-rose-500" size={14} />;
      
      case 'CREATE_PRODUCT':
      case 'CREATE_COUPON': return <Package className="text-emerald-500" size={14} />;
      case 'UPDATE_PRODUCT':
      case 'UPDATE_COUPON':
      case 'UPDATE_ORDER_STATUS': return <RefreshCcw className="text-amber-500" size={14} />;
      case 'DELETE_PRODUCT':
      case 'DELETE_COUPON': return <Trash2 className="text-rose-500" size={14} />;
      case 'APPROVE_CANCELLATION': return <CheckCircle2 className="text-emerald-500" size={14} />;
      case 'REJECT_CANCELLATION': return <XCircle className="text-rose-500" size={14} />;
      
      default: return <HelpCircle className="text-slate-400" size={14} />;
    }
  };

  const tableData = activities.map(act => ({
    user: (
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5">
          <div className={clsx(
            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border",
            act.userEmail === 'ADMIN' || act.userEmail === 'SYSTEM' 
              ? "bg-primary-500/10 border-primary-500/20 text-primary-500" 
              : "bg-slate-800 border-slate-700 text-slate-400"
          )}>
            {act.userEmail.charAt(0).toUpperCase()}
          </div>
          <span className={clsx(
            "text-sm font-bold",
            act.userEmail === 'ADMIN' || act.userEmail === 'SYSTEM' ? "text-primary-500" : "text-white"
          )}>{act.userEmail}</span>
        </div>
        <p className="text-[9px] text-slate-500 font-medium ml-9 -mt-0.5 mt-0">{act.userId ? `User ID: ${act.userId}` : 'System Action'}</p>
      </div>
    ),
    group: (
      <div className={clsx(
        "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border",
        act.actionGroup === 'ACCOUNT' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
        act.actionGroup === 'SHOPPING' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
        "bg-amber-500/10 text-amber-500 border-amber-500/20"
      )}>
        <div className={clsx(
          "w-1 h-1 rounded-full",
          act.actionGroup === 'ACCOUNT' ? "bg-blue-500" :
          act.actionGroup === 'SHOPPING' ? "bg-emerald-500" : "bg-amber-500"
        )} />
        {act.actionGroup === 'ACCOUNT' ? 'Tài khoản' : 
         act.actionGroup === 'SHOPPING' ? 'Mua sắm' : 'Hệ thống'}
      </div>
    ),
    action: (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-slate-800/50">
          {getActionIcon(act.actionType)}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">{act.actionType}</span>
      </div>
    ),
    description: (
      <div className="flex flex-col gap-1 max-w-md">
        <p className="text-slate-400 text-xs font-medium leading-relaxed">{act.description}</p>
        {act.ipAddress && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Globe size={10} />
            <span className="text-[10px] font-mono tracking-tighter">IP: {act.ipAddress}</span>
          </div>
        )}
      </div>
    ),
    time: (
      <div className="flex flex-col text-right">
        <span className="text-white text-xs font-black">
          {new Date(act.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
          {new Date(act.createdAt).toLocaleDateString('vi-VN')}
        </span>
      </div>
    )
  }));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            Nhật ký hoạt động
          </h1>
          <p className="text-slate-500 text-sm mt-3 italic font-medium flex items-center gap-2">
            <Globe size={14} className="text-primary-500/50" />
            Theo dõi thời gian thực các thao tác người dùng và hệ thống.
          </p>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={clsx(
            "flex items-center gap-2.5 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-800 hover:border-slate-700 active:scale-95 group",
            isRefreshing && "opacity-70"
          )}
        >
          <RefreshCcw size={16} className={clsx("text-primary-500 transition-all", isRefreshing && "animate-spin")} />
          <span className="text-slate-300">Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Tabs Filter & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex p-1.5 bg-slate-900/50 border border-slate-800 rounded-2xl md:w-fit overflow-x-auto no-scrollbar">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            const isActive = selectedGroup === group.id;
            
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={clsx(
                  "relative flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={14} className={clsx("relative z-10", isActive ? "text-white" : "text-slate-500")} />
                <span className="relative z-10">{group.name}</span>
              </button>
            );
          })}
        </div>

        <div className="relative group max-w-sm w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
           <input 
             type="text"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Tìm kiếm email, nội dung..."
             className="w-full bg-slate-900/50 border border-slate-800 text-slate-100 text-sm rounded-2xl py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-600"
           />
           {searchQuery && (
             <button 
               onClick={() => setSearchQuery('')}
               className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
             >
               <X size={16} />
             </button>
           )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-500/10 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Đang truy xuất dữ liệu...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6 text-center px-10">
            <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-700">
              <Activity size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Chưa có hoạt động</h3>
              <p className="text-slate-500 text-sm max-w-xs">Không tìm thấy bản ghi nhật ký nào trong nhóm này tại thời điểm hiện tại.</p>
            </div>
          </div>
        ) : (
          <Table 
            columns={[
              { header: "Đối tượng", key: "user" },
              { header: "Phân loại", key: "group" },
              { header: "Thao tác", key: "action" },
              { header: "Mô tả chi tiết", key: "description" },
              { header: "Thời gian", key: "time" }
            ]} 
            data={tableData} 
          />
        )}
      </div>
    </div>
  );
};
