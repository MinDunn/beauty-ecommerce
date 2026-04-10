import { MapPin, Phone, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const stores = [
  {
    city: 'Hồ Chí Minh',
    locations: [
      { 
        name: 'Glowzy Premium Flagship', 
        address: '88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh', 
        phone: '028 4567 8888', 
        hours: '08:00 - 22:00' 
      },
      { 
        name: 'Glowzy Thảo Điền', 
        address: '24 Xuân Thủy, P. Thảo Điền, Quận 2', 
        phone: '028 4567 9999', 
        hours: '09:00 - 21:00' 
      },
      { 
        name: 'Glowzy Crescent Mall', 
        address: 'Tầng 2, 101 Tôn Dật Tiên, Quận 7', 
        phone: '028 4567 1111', 
        hours: '10:00 - 22:00' 
      }
    ]
  },
  {
    city: 'Hà Nội',
    locations: [
      { 
        name: 'Glowzy Hoàn Kiếm', 
        address: '15 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', 
        phone: '024 4567 8888', 
        hours: '09:00 - 22:00' 
      },
      { 
        name: 'Glowzy Vincom Bà Triệu', 
        address: 'Tầng 1, 191 Bà Triệu, Quận Hai Bà Trưng', 
        phone: '024 4567 2222', 
        hours: '09:30 - 22:00' 
      }
    ]
  },
  {
    city: 'Đà Nẵng',
    locations: [
      { 
        name: 'Glowzy Đà Nẵng Center', 
        address: '256 Hùng Vương, Quận Thanh Khê, Đà Nẵng', 
        phone: '0236 4567 8888', 
        hours: '08:00 - 21:30' 
      }
    ]
  }
];

const Stores = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div>
               <div className="flex items-center gap-2 text-primary-600 font-bold uppercase tracking-widest text-xs mb-4">
                 <MapPin size={14} />
                 <span>Tìm kiếm cửa hàng</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase">
                 Hệ thống <span className="text-primary-500">Cửa hàng</span>
               </h1>
             </div>
             <div className="relative w-full md:w-96">
               <input 
                type="text" 
                placeholder="Nhập quận/huyện hoặc tên đường..."
                className="w-full pl-6 pr-14 py-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-xl">
                 <Search size={20} />
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Sidebar Cities */}
           <div className="lg:col-span-3 space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Khu vực</h3>
              {stores.map((city) => (
                <button 
                  key={city.city}
                  className="w-full text-left px-6 py-4 rounded-2xl bg-white border border-gray-100 hover:border-primary-500 hover:shadow-md transition-all font-bold text-slate-700 hover:text-primary-600"
                >
                  {city.city}
                </button>
              ))}
           </div>

           {/* Results Grid */}
           <div className="lg:col-span-9 space-y-12">
              {stores.map((region) => (
                <div key={region.city} className="space-y-6">
                   <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                     {region.city}
                     <div className="flex-1 h-[2px] bg-gray-100" />
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {region.locations.map((store, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          key={i} 
                          className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-2xl hover:border-primary-100 transition-all group"
                        >
                           <h4 className="text-xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors uppercase">{store.name}</h4>
                           <div className="space-y-4 text-sm text-gray-500 font-medium">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-primary-500 transition-colors">
                                  <MapPin size={16} />
                                </div>
                                <p className="leading-relaxed">{store.address}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-primary-500 transition-colors">
                                  <Phone size={16} />
                                </div>
                                <p>{store.phone}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-primary-500 transition-colors">
                                  <Clock size={16} />
                                </div>
                                <p>{store.hours}</p>
                              </div>
                           </div>
                           <button className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-primary-500 transition-colors">
                              Xem bản đồ
                           </button>
                        </motion.div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Stores;
