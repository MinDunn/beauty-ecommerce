import { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Lock, Phone, MapPin, Package, Settings, ChevronRight, Camera } from 'lucide-react';
import type { RootState } from '../store';
import { cn } from '../utils/cn';

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('info');
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API update
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    // In a real app, we would dispatch an update user action here
    alert('Đã cập nhật thông tin thành công!');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4 space-y-4">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-black border-4 border-white shadow-md">
                   {user?.name?.[0] || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-primary-500 transition-colors">
                   <Camera size={16} />
                </button>
              </div>
              <h3 className="text-xl font-black text-gray-900">{user?.name}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
            </div>

            <nav className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 p-2">
              {[
                { id: 'info', label: 'Thông tin cá nhân', icon: User },
                { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
                { id: 'security', label: 'Bảo mật', icon: Lock },
                { id: 'settings', label: 'Thiết lập', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                    activeTab === item.id 
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === item.id ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 min-h-[600px]">
              
              {activeTab === 'info' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Hồ sơ cá nhân</h2>
                    <p className="text-gray-500 font-medium">Cập nhật thông tin của bạn để có trải nghiệm mua sắm tốt nhất.</p>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" 
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                       <div className="relative">
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Chưa cập nhật" 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" 
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email (Không thể thay đổi)</label>
                       <div className="relative">
                        <input type="email" readOnly defaultValue={user?.email} className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-transparent rounded-2xl text-gray-500 cursor-not-allowed font-bold" />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ giao hàng mặc định</label>
                       <div className="relative">
                        <textarea 
                          rows={2} 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="Vui lòng điền địa chỉ để nhận hàng" 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold resize-none" 
                        />
                        <MapPin className="absolute left-4 top-6 text-gray-400" size={20} />
                       </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="px-10 py-4 bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all hover:-translate-y-1 uppercase tracking-widest disabled:opacity-70"
                      >
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Đơn hàng của tôi</h2>
                      <p className="text-gray-500 font-medium">Theo dõi lịch sử và tình trạng đơn hàng.</p>
                    </div>
                    <span className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-xs font-black">2 Đơn hàng</span>
                  </div>

                  <div className="space-y-4">
                    {/* Fake Order List */}
                    <div className="border border-gray-100 rounded-3xl p-6 hover:border-primary-200 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center space-x-3 font-black text-sm uppercase tracking-tighter">
                          <span className="text-gray-400">Mã đơn:</span>
                          <span className="text-gray-900">#GLW88921</span>
                        </div>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg">Đã giao hàng</span>
                        <span className="text-xs text-gray-400 font-bold ml-auto">01/01/2026</span>
                      </div>
                      <div className="flex items-center space-x-4">
                         <div className="w-16 h-16 rounded-2xl bg-gray-50 p-2 overflow-hidden border border-gray-100 flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-contain mix-blend-multiply" />
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">Kem Chống Nắng La Roche-Posay Anthelios...</h4>
                            <p className="text-xs text-gray-400 mt-1">Số lượng: 02</p>
                         </div>
                         <div className="text-right">
                            <span className="text-lg font-black text-primary-600 tracking-tighter">870.000đ</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Bảo mật tài khoản</h2>
                    <p className="text-gray-500 font-medium">Bảo vệ quyền truy cập và dữ liệu của bạn.</p>
                  </div>

                  <form className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                      <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                      <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                       <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" />
                    </div>
                    <button type="button" className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all hover:scale-[1.02] uppercase tracking-widest">
                       Đổi mật khẩu ngay
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                      <Settings size={40} />
                   </div>
                   <h3 className="text-xl font-black text-gray-800 mb-2">Đang xây dựng</h3>
                   <p className="text-gray-500">Tính năng này sẽ sớm ra mắt khách yêu nhé!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
