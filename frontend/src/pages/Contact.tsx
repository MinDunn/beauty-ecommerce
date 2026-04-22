import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { contactService } from '../api/contactService';
import { toast } from 'react-hot-toast';

const HEAD_OFFICE_MAP = "https://www.google.com/maps?q=Empress+Tower+138+Hai+Ba+Trung+Ho+Chi+Minh&output=embed";

const Contact = () => {
  const [mapUrl, setMapUrl] = useState(HEAD_OFFICE_MAP);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await contactService.createContact(data);
      toast.success('Cảm ơn bạn đã góp ý! Chúng tôi sẽ phản hồi sớm nhất.');
      reset();
    } catch (error) {
      console.error('Lỗi khi gửi feedback:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Contact Info & Form */}
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Góp ý cho <span className="text-primary-500">Glowzy</span></h1>
          <p className="text-lg text-gray-600 font-medium">Chúng tôi luôn lắng nghe và hỗ trợ bạn 24/7.</p>

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
                <p className="font-bold text-gray-900">Email</p>
                <p className="text-gray-600 text-sm">info@glowzy.com</p>
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
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi ý kiến'}</span>
              {!isSubmitting && <Send size={18} />}
            </button>
          </form>
        </div>

        {/* Google Maps */}
        <div className="h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative group">
          <button 
            onClick={() => setMapUrl(`${HEAD_OFFICE_MAP}&t=${Date.now()}`)}
            className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-gray-100 hover:bg-primary-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 group/btn"
          >
            <MapPin size={18} className="text-primary-500 group-hover/btn:text-white transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-inherit">Về địa chỉ trụ sở</span>
          </button>
          <iframe 
            src={mapUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="group-hover:opacity-90 transition-opacity"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
