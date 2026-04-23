import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Settings as SettingsIcon, Truck, Home, Save, Info, RefreshCcw } from "lucide-react";
import { settingService } from "../../api/settingService";
import type { SystemSetting } from "../../api/settingService";

export default function Settings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingService.getAllSettings();
      setSettings(data);
      const initialValues: Record<string, string> = {};
      data.forEach((s: SystemSetting) => {
        initialValues[s.key] = s.value;
      });
      setEditedValues(initialValues);
    } catch (error) {
      toast.error("Không thể tải cấu hình hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await settingService.updateSettings(editedValues);
      toast.success("Đã cập nhật cấu hình hệ thống");
      fetchSettings();
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const shippingSettings = settings.filter(s => 
    ['SHIPPING_FEE_CITY', 'SHIPPING_FEE_PROVINCE', 'SHIPPING_FREE_THRESHOLD'].includes(s.key)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary-500/20 transition-colors duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-primary-500/20 p-3 rounded-2xl border border-primary-500/30">
              <SettingsIcon className="text-primary-500 w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Cài đặt <span className="text-primary-500">Hệ thống</span></h1>
          </div>
          <p className="text-slate-400 font-medium">Quản lý cấu hình phí vận chuyển và các tham số toàn cục.</p>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={isUpdating}
          className="relative z-10 flex items-center gap-3 px-8 py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary-500/25 group"
        >
          {isUpdating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
          Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-8">
          <div className="flex items-center gap-3 mb-8">
            <Truck className="text-primary-500 w-6 h-6" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Cấu hình Vận chuyển</h2>
          </div>

          <div className="space-y-6">
            {shippingSettings.map(setting => (
              <div key={setting.id} className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  {setting.key === 'SHIPPING_FEE_CITY' && <Home size={12} />}
                  {setting.description}
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={editedValues[setting.key]}
                    onChange={(e) => setEditedValues({...editedValues, [setting.key]: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all group-hover:border-slate-600 pr-12"
                    placeholder="Nhập giá trị..."
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs uppercase">VND</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-8 flex flex-col justify-center">
          <div className="bg-primary-500/5 rounded-3xl p-8 border border-primary-500/10">
            <div className="flex items-center gap-3 mb-4 text-primary-500">
              <Info size={20} />
              <h3 className="font-black uppercase tracking-widest text-sm">Hướng dẫn vận hành</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <span className="text-primary-500 font-black">•</span>
                <span>Các thay đổi sẽ được áp dụng ngay lập tức cho các đơn hàng mới sau khi bạn bấm <strong>Lưu thay đổi</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-500 font-black">•</span>
                <span><strong>Phí Thành phố:</strong> Áp dụng cho 6 thành phố trực thuộc trung ương theo quy hoạch mới.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-500 font-black">•</span>
                <span><strong>Phí Tỉnh:</strong> Áp dụng cho 28 tỉnh còn lại trong danh sách vận chuyển.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-500 font-black">•</span>
                <span><strong>Ngưỡng Freeship:</strong> Đơn hàng có tổng giá trị hàng hóa lớn hơn hoặc bằng con số này sẽ được miễn phí ship.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
