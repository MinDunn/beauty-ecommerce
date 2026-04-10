import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../../api/authService';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Yêu cầu đã được gửi!');
    } catch (error) {
      console.error('Lỗi khi yêu cầu quên mật khẩu:', error);
      toast.error('Có lỗi xảy ra hoặc email không tồn tại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200 border border-gray-100">
        {!isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center mb-6">
                <LockIcon />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quên mật khẩu?</h2>
              <p className="mt-4 text-sm text-gray-500 font-medium">
                Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Email nhận liên kết</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                    placeholder="name@example.com"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex justify-center py-4 px-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-primary-500 transition-all uppercase tracking-widest shadow-lg shadow-slate-200 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Gửi yêu cầu <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-primary-500 transition-colors">
                <ArrowLeft size={16} /> Quay lại đăng nhập
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Kiểm tra Email của bạn</h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-10">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới <br />
              <strong className="text-slate-900 font-bold">{email}</strong>. <br />
              Vui lòng kiểm tra cả hộp thư rác nếu không thấy.
            </p>
            <Link 
              to="/login"
              className="inline-block w-full py-4 bg-primary-500 text-white font-black rounded-2xl hover:bg-primary-600 transition-all uppercase tracking-widest shadow-lg shadow-primary-200"
            >
              Quay lại Đăng nhập
            </Link>
            <p className="mt-8 text-sm text-gray-400 font-medium">
              Không nhận được email? <button onClick={() => setIsSubmitted(false)} className="text-primary-500 font-bold hover:underline">Gửi lại</button>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default ForgotPassword;
