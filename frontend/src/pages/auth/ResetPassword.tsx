import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../../api/authService';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        toast.error('Token không hợp lệ!');
        return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải từ 6 ký tự!');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setIsSuccess(true);
      toast.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      toast.error('Token đã hết hạn hoặc không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">Link không hợp lệ!</h1>
          <p className="text-gray-500 mb-8">Link đặt lại mật khẩu của bạn thiếu token hoặc đã bị hỏng.</p>
          <Link to="/forgot-password" className="inline-block px-8 py-3 bg-primary-500 text-white font-bold rounded-2xl">
            Yêu cầu link mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        {isSuccess ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Thành Công!</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Mật khẩu của bạn đã được thay đổi. Đang chuyển hướng bạn về trang đăng nhập...
            </p>
            <Link 
              to="/login"
              className="flex items-center justify-center w-full px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all group"
            >
              Đăng nhập ngay
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-6">
                <Lock className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Đặt Lại Mật Khẩu</h2>
              <p className="text-slate-500 font-medium px-4">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all outline-none"
                    placeholder="Mật khẩu mới"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all outline-none"
                    placeholder="Xác nhận mật khẩu"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 bg-primary-500 text-white text-lg font-black rounded-2xl hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Cập nhật mật khẩu 
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
