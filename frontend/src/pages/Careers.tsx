import { Briefcase, MapPin, Users, Heart, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const jobs = [
  { 
    title: 'Cửa hàng trưởng (Store Manager)', 
    location: 'Hồ Chí Minh', 
    type: 'Full-time', 
    department: 'Cửa hàng',
    salary: 'Thoả thuận'
  },
  { 
    title: 'Chuyên viên Tư vấn Làm đẹp', 
    location: 'Hà Nội', 
    type: 'Full-time / Part-time', 
    department: 'Cửa hàng',
    salary: '8M - 15M + Comm'
  },
  { 
    title: 'Senior Frontend Engineer (React)', 
    location: 'Hồ Chí Minh / Remote', 
    type: 'Full-time', 
    department: 'Công nghệ',
    salary: '2500$ - 4000$'
  },
  { 
    title: 'Graphic Designer', 
    location: 'Hồ Chí Minh', 
    type: 'Full-time', 
    department: 'Marketing',
    salary: '15M - 25M'
  }
];

const Careers = () => {
  return (
    <div className="bg-white pb-32">
      {/* Hero Section */}
      <div className="bg-primary-500 py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold text-xs uppercase tracking-[0.2em] mb-8"
           >
             <Sparkles size={14} />
             <span>Join our Glowzy Family</span>
           </motion.div>
           <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
             KIẾN TẠO TƯƠNG LAI <br /> <span className="italic text-primary-200">NGÀNH LÀM ĐẸP</span>
           </h1>
           <p className="text-primary-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
             Hãy cùng chúng tôi mang lại sự tự tin và nụ cười cho hàng triệu khách hàng mỗi ngày. 
             Sự nghiệp của bạn tỏa sáng tại Glowzy.
           </p>
        </div>
      </div>

      {/* Why Glowzy */}
      <div className="container mx-auto px-4 max-w-7xl -mt-16 relative z-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Môi trường trẻ trung', desc: 'Làm việc cùng những đồng nghiệp năng động, sáng tạo và đầy nhiệt huyết.' },
              { icon: Star, title: 'Lộ trình rõ ràng', desc: 'Cơ hội thăng tiến định kỳ 6 tháng và đào tạo chuyên sâu từ chuyên gia.' },
              { icon: Heart, title: 'Phúc lợi hấp dẫn', desc: 'Bảo hiểm cao cấp, thưởng KPI quý và ưu đãi mua sắm độc quyền.' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                <div className="p-4 bg-primary-50 text-primary-500 rounded-2xl mb-6 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <item.icon size={32} />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3">{item.title}</h4>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Current Openings */}
      <div className="container mx-auto px-4 max-w-5xl mt-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Vị trí đang tuyển</h2>
          <div className="w-20 h-1.5 bg-primary-500 mx-auto mt-6 rounded-full" />
        </div>

        <div className="space-y-4">
           {jobs.map((job, i) => (
             <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="group bg-gray-50 hover:bg-white rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between border-2 border-transparent hover:border-gray-100 hover:shadow-2xl transition-all cursor-pointer"
             >
                <div className="mb-6 md:mb-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 px-3 py-1 rounded-full mb-3 inline-block">
                    {job.department}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase mt-2">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-500 font-bold">
                     <div className="flex items-center gap-2">
                       <MapPin size={16} />
                       <span>{job.location}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Briefcase size={16} />
                       <span>{job.type}</span>
                     </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-6 md:pt-0 border-gray-100">
                  <p className="text-primary-600 font-black text-lg">{job.salary}</p>
                  <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-colors">
                    Ứng tuyển ngay
                  </button>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-primary-500/5" />
           <h3 className="text-2xl md:text-3xl font-black text-white mb-6 relative z-10">Chưa tìm thấy vị trí phù hợp?</h3>
           <p className="text-slate-400 font-medium mb-10 relative z-10">Hãy gửi CV của bạn cho chúng tôi, bộ phận nhân sự sẽ liên hệ khi có cơ hội mới.</p>
           <button className="bg-white text-slate-900 px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all relative z-10 shadow-xl">
             Gửi hồ sơ tổng quát
           </button>
        </div>
      </div>
    </div>
  );
};

export default Careers;
