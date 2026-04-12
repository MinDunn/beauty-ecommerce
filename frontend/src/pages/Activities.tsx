import { useState, useEffect } from "react";
import { adminService } from "../api/adminService";
import { Table } from "../components/admin/Table";
import { toast } from "react-hot-toast";
import { Activity, ShoppingCart, User, CreditCard, LogIn, Trash2 } from "lucide-react";

export const Activities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const response = await adminService.getRecentActivities();
      setActivities(response);
    } catch (error) {
      toast.error("Không thể tải danh sách hoạt động");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ADD_TO_CART': return <ShoppingCart className="text-emerald-500" size={16} />;
      case 'REMOVE_FROM_CART': return <Trash2 className="text-rose-500" size={16} />;
      case 'PLACE_ORDER': return <CreditCard className="text-primary-500" size={16} />;
      case 'LOGIN': return <LogIn className="text-blue-500" size={16} />;
      default: return <Activity className="text-slate-400" size={16} />;
    }
  };

  const tableData = activities.map(act => ({
    user: (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
          <User size={14} className="text-slate-400" />
        </div>
        <span className="text-white text-sm font-medium">{act.userEmail}</span>
      </div>
    ),
    action: (
      <div className="flex items-center gap-2">
        {getIcon(act.actionType)}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{act.actionType}</span>
      </div>
    ),
    description: (
      <p className="text-slate-500 text-xs italic line-clamp-1">{act.description}</p>
    ),
    time: (
      <span className="text-slate-400 text-[10px] font-bold">
        {new Date(act.createdAt).toLocaleString('vi-VN')}
      </span>
    )
  }));

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hoạt động người dùng</h1>
          <p className="text-slate-500 text-sm mt-1 italic">Theo dõi thời gian thực các thao tác của người dùng trên hệ thống.</p>
        </div>
        <div className="bg-primary-500/10 px-4 py-2 rounded-xl border border-primary-500/20">
          <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Thời gian thực</p>
        </div>
      </div>

      <Table 
        columns={[
          { header: "Người dùng", key: "user" },
          { header: "Thao tác", key: "action" },
          { header: "Chi tiết", key: "description" },
          { header: "Thời gian", key: "time" }
        ]} 
        data={tableData} 
      />
    </div>
  );
};
