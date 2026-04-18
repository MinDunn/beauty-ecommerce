import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { LoginFormValues } from '../../schemas/authSchema';
import { loginSchema } from '../../schemas/authSchema';
import { setCredentials } from '../../store/slices/authSlice';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        // Dùng access_token từ Google để lấy thông tin user
        const googleUserInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await googleUserInfo.json();
        console.log('Google User Info:', userInfo);

        // Gửi thông tin user lên backend
        const response = await axiosInstance.post('/auth/google', {
          email: userInfo.email,
          fullName: userInfo.name,
          pictureUrl: userInfo.picture,
          googleId: userInfo.sub,
        });

        const authData = response.data.data;
        const { accessToken, email, fullName, role } = authData;
        
        dispatch(setCredentials({
          user: { email, fullName, role },
          token: accessToken,
        }));

        toast.success('Đăng nhập bằng Google thành công!');
        navigate(role === 'ADMIN' ? '/admin' : '/');
      } catch (error: any) {
        console.error('Google Login Error:', error.response?.data || error);
        const msg = error.response?.data?.message || 'Đăng nhập Google thất bại';
        toast.error(msg);
      }
    },
    onError: (error) => {
      console.error('Google OAuth Error:', error);
      toast.error('Không thể kết nối với Google. Vui lòng thử lại.');
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      // Backend trả về ApiResponse { status, message, data: AuthResponse }
      const authData = response.data.data;
      const { accessToken, email, fullName, role } = authData;

      dispatch(setCredentials({
        user: { email, fullName, role },
        token: accessToken,
      }));

      toast.success('Đăng nhập thành công!');

      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Đăng nhập</h2>
          <p className="mt-2 text-sm text-gray-600">Chào mừng bạn quay lại với Glowzy</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all`}
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mật khẩu</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900 font-medium">Ghi nhớ đăng nhập</label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-bold text-primary-600 hover:text-primary-500">Quên mật khẩu?</Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all uppercase tracking-widest disabled:opacity-70"
          >
            {isSubmitting ? 'Đang xử lý...' : (
              <span className="flex items-center">
                Đăng nhập <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-black text-primary-600 hover:text-primary-500 ml-1">Đăng ký ngay</Link>
          </p>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Hoặc đăng nhập với</span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-gray-700 font-semibold text-sm">Đăng nhập bằng Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
