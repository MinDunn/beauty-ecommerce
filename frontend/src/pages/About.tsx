import { Sparkles, Heart, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="bg-white pb-24">
      {/* Hero Section */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6 italic"
          >
            VỀ <span className="text-primary-500">GLOWZY</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto"
          >
            Nâng tầm vẻ đẹp tự nhiên của bạn bằng những giải pháp chăm sóc sức khỏe và sắc đẹp hiện đại nhất.
          </motion.p>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 max-w-7xl -mt-12 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border border-gray-100">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-8">
                  Câu chuyện của chúng tôi
                </h2>
                <div className="space-y-6 text-gray-600 leading-relaxed font-medium">
                  <p>
                    Glowzy bắt đầu từ một niềm tin đơn giản: <strong className="text-slate-900 font-bold">Làm đẹp không nên là một gánh nặng.</strong> Chúng tôi tin rằng mỗi người đều sở hữu một vẻ đẹp riêng biệt, và nhiệm vụ của chúng tôi là giúp bạn tỏa sáng hơn mỗi ngày.
                  </p>
                  <p>
                    Được thành lập vào năm 2026, Glowzy đã nhanh chóng trở thành điểm đến tin cậy của hàng triệu khách hàng yêu thích chăm sóc bản thân tại Việt Nam. Không chỉ là một chuỗi cửa hàng bán lẻ, chúng tôi là người bạn đồng hành trên hành trình tự tin hơn của bạn.
                  </p>
                  <div className="pt-4 grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-4xl font-black text-primary-500 mb-1">100+</p>
                        <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Cửa hàng toàn quốc</p>
                     </div>
                     <div>
                        <p className="text-4xl font-black text-primary-500 mb-1">500k+</p>
                        <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Khách hàng tin dùng</p>
                     </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] bg-gray-100 rounded-[2.5rem] overflow-hidden">
                   <img 
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087&auto=format&fit=crop" 
                    alt="Glowzy Store" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                   />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-primary-500 text-white p-10 rounded-full hidden md:block border-8 border-white">
                   <Sparkles size={48} />
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="container mx-auto px-4 max-w-7xl mt-32">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Giá trị cốt lõi</h2>
           <p className="text-gray-500 font-medium">Tại sao bạn nên chọn Glowzy cho hành trình làm đẹp của mình?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { 
               icon: ShieldCheck, 
               title: 'Chính hãng 100%', 
               desc: 'Chúng tôi cam kết mọi sản phẩm trên kệ đều được nhập khẩu chính ngạch từ các thương hiệu hàng đầu thế giới.' 
             },
             { 
               icon: Heart, 
               title: 'Tận tâm phục vụ', 
               desc: 'Đội ngũ tư vấn của Glowzy luôn lắng nghe và thấu hiểu nhu cầu riêng biệt của từng làn da.' 
             },
             { 
               icon: Zap, 
               title: 'Luôn luôn mới', 
               desc: 'Chúng tôi không ngừng cập nhật những xu hướng làm đẹp mới nhất và các công nghệ chăm sóc sức khỏe tiên tiến.' 
             }
           ].map((val, i) => (
             <div key={i} className="p-10 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-500 mb-8 border border-gray-100 group-hover:bg-primary-500 group-hover:text-white group-hover:rotate-12 transition-all">
                   <val.icon size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{val.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{val.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default About;
