import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    console.log('Contact form data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Contact Info & Form */}
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Liên hệ với <span className="text-guardian-green">Guardian</span></h1>
          <p className="text-gray-600 mb-10 text-lg">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</p>

          <div className="space-y-6 mb-12">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-500">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Địa chỉ trụ sở</h4>
                <p className="text-gray-600 text-sm">Lầu 15, Tòa nhà Empress, 138-142 Hai Bà Trưng, P. Đa Kao, Quận 1, TP. HCM</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-500">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Hotline</h4>
                <p className="text-gray-600 text-sm">1900 633 023 (9:00 - 18:00)</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-xl text-primary-500">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Email</h4>
                <p className="text-gray-600 text-sm">info@guardian.com.vn</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Họ và tên</label>
                <input 
                  {...register('name', { required: 'Vui lòng nhập họ tên' })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Nguyễn Văn A"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Số điện thoại</label>
                <input 
                  {...register('phone', { required: 'Vui lòng nhập số điện thoại' })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="0901234567"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message as string}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
              <input 
                {...register('email', { required: 'Vui lòng nhập email' })}
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Lời nhắn</label>
              <textarea 
                {...register('message', { required: 'Vui lòng nhập lời nhắn' })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                placeholder="Bạn cần hỗ trợ gì?"
              />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message as string}</p>}
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-primary-500 text-white font-black py-4 rounded-xl hover:bg-primary-600 transition-all uppercase tracking-widest disabled:opacity-70"
            >
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</span>
              {!isSubmitting && <Send size={18} />}
            </button>
          </form>
        </div>

        {/* Google Maps */}
        <div className="h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424361555627!2d106.697495!3d10.7818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f357908b981%3A0x6a0c0e7b95f190e4!2zMTM4IEhhaSBCw6AgVHLGsG5nLCDEkGEgS2FvLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1711700000000!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
