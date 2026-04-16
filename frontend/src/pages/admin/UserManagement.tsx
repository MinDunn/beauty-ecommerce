import { useState, useEffect } from "react";
import { Table } from "../../components/admin/Table";
import { adminUserService, type AdminUser } from "../../api/adminUserService";
import { toast } from "react-hot-toast";
import { User, Lock, Unlock, Mail, Phone, Calendar, Search, Plus, Key, Edit, ShieldCheck, Users, MapPin } from "lucide-react";
import { clsx } from "clsx";
import { Modal } from "../../components/admin/Modal";

export const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'USER'>('ADMIN');
  
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "ADMIN"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getAllUsers();
      setUsers(res.data.data);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminUserService.createUser(newUser);
      toast.success("Đã tạo tài khoản Quản trị viên thành công");
      setShowAddModal(false);
      setNewUser({ fullName: "", email: "", password: "", role: "ADMIN" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await adminUserService.updateUserDetails(editingUser.id, {
        fullName: editingUser.fullName,
        phone: editingUser.phone || "",
        address: editingUser.address || ""
      });
      toast.success("Cập nhật thông tin thành công");
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, isActive: boolean) => {
    try {
      await adminUserService.updateUserStatus(id, isActive);
      toast.success(isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản thành công");
      fetchUsers();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredUsers = users.filter(user => 
    user.role === activeTab && (
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const tableData = filteredUsers.map(user => ({
    user: (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-slate-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{user.fullName}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-tighter">
            <span>ID: #{user.id}</span>
          </div>
        </div>
      </div>
    ),
    contact: (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Mail size={12} className="text-slate-600" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Phone size={12} className="text-slate-600" />
            <span>{user.phone}</span>
          </div>
        )}
      </div>
    ),
    status: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => user.email !== 'admin@beauty.com' && handleStatusUpdate(user.id, !user.isActive)}
          disabled={user.email === 'admin@beauty.com'}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
            user.email === 'admin@beauty.com' 
              ? "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/50"
              : user.isActive 
                ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" 
                : "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
          )}
        >
          {user.isActive ? (
            <><Unlock size={14} /> Hoạt động</>
          ) : (
            <><Lock size={14} /> Đã khóa</>
          )}
        </button>
        
        <button
          onClick={() => setEditingUser(user)}
          className="p-2 bg-slate-800 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all"
          title="Chỉnh sửa thông tin"
        >
          <Edit size={14} />
        </button>
      </div>
    ),
    date: (
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
        <Calendar size={12} />
        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
      </div>
    )
  }));

  if (loading && users.length === 0) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Quản trị nhân sự</h1>
            <p className="text-slate-500 text-sm mt-1 italic">Phân tách, chỉnh sửa và kiểm soát toàn bộ tài khoản hệ thống.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..." 
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl py-3 pl-10 pr-4 w-60 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Tabs & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'ADMIN' ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <ShieldCheck size={16} />
            Quản trị viên
            <span className="ml-2 px-1.5 py-0.5 bg-black/20 rounded text-[10px]">
              {users.filter(u => u.role === 'ADMIN').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('USER')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'USER' ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Users size={16} />
            Khách hàng
            <span className="ml-2 px-1.5 py-0.5 bg-black/20 rounded text-[10px]">
              {users.filter(u => u.role === 'USER').length}
            </span>
          </button>
        </div>

        {activeTab === 'ADMIN' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 active:scale-95 whitespace-nowrap mr-1"
          >
            <Plus size={16} />
            Thêm Admin mới
          </button>
        )}
      </div>

      <Table 
        columns={[
          { header: "Thành viên", key: "user" },
          { header: "Liên hệ", key: "contact" },
          { header: "Trạng thái & Thao tác", key: "status" },
          { header: "Ngày tham gia", key: "date" }
        ]} 
        data={tableData} 
      />

      {/* Add Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Thêm Quản trị viên mới">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  required
                  type="text"
                  value={newUser.fullName}
                  onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="Nhập họ tên..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  required
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="******"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-[2] py-3 rounded-xl bg-primary-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang tạo..." : "Xác nhận tạo Admin"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <Modal onClose={() => setEditingUser(null)} title="Chỉnh sửa thông tin">
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  required
                  type="text"
                  value={editingUser.fullName}
                  onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  type="text"
                  value={editingUser.phone || ""}
                  onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="Số điện thoại..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  type="text"
                  value={editingUser.address || ""}
                  onChange={e => setEditingUser({...editingUser, address: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="Địa chỉ..."
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-[2] py-3 rounded-xl bg-primary-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
