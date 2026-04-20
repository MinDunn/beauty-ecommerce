import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Feedback } from "../types";
import { Table } from "../components/admin/Table";
import { feedbackService } from "../api/feedbackService";
import { reviewService, type Review } from "../api/reviewService";
import { toast } from "react-hot-toast";
import { MessageSquare, User, Mail, Calendar, Star, Package, Trash2, Check, Send } from "lucide-react";
import { clsx } from "clsx";
import AdminChat from "../components/admin/AdminChat";

type FeedbackTab = 'chat' | 'reviews' | 'suggestions';

export const FeedbackPage = () => {
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FeedbackTab>('chat');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactRes, reviewRes] = await Promise.all([
        feedbackService.getAllFeedbacks(),
        reviewService.getAllReviews()
      ]);
      setFeedbacks(contactRes);
      setReviews(reviewRes.data.data);
    } catch (error) {
      toast.error("Không thể tải dữ liệu phản hồi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') as FeedbackTab;
    if (tab && ['chat', 'reviews', 'suggestions'].includes(tab)) {
      setActiveTab(tab);
    }
    fetchData();
  }, [location.search]);

  const handleDeleteContact = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phản hồi này không?')) return;
    
    try {
      await feedbackService.deleteFeedback(id);
      toast.success('Xóa phản hồi thành công');
      fetchData();
    } catch (error) {
      toast.error('Không thể xóa phản hồi');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await feedbackService.markAsRead(id);
      toast.success('Đã đánh dấu đã đọc');
      fetchData();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const contactTableData = feedbacks.map(fb => ({
    user: (
      <div className="flex flex-col">
        <span className="text-white font-bold flex items-center gap-2 text-sm">
          <User size={12} className="text-slate-500" /> {fb.name}
        </span>
        <span className="text-slate-500 text-[10px] flex items-center gap-2">
          <Mail size={10} /> {fb.email}
        </span>
      </div>
    ),
    message: (
      <div className="max-w-md">
        <p className="text-slate-300 text-sm italic line-clamp-2 bg-slate-800/30 p-3 rounded-xl border border-slate-800 leading-relaxed">
          "{fb.message}"
        </p>
      </div>
    ),
    date: (
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <Calendar size={12} />
        {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
      </div>
    ),
    actions: (
      <div className="flex items-center justify-end gap-2">
        {!fb.isRead && (
          <button 
            onClick={() => handleMarkAsRead(fb.id)}
            className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-inner border border-emerald-500/20"
            title="Đánh dấu đã đọc"
          >
            <Check size={16} />
          </button>
        )}
        <button 
          onClick={() => handleDeleteContact(fb.id)}
          className="p-2.5 bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-inner"
          title="Xóa phản hồi"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
    rowClassName: !fb.isRead ? "bg-primary-500/[0.03]" : ""
  }));

  const reviewTableData = reviews.map(rev => ({
    user: (
      <div className="flex flex-col">
        <span className="text-white font-bold flex items-center gap-2 text-sm">
          <User size={12} className="text-slate-500" /> {rev.userFullName}
        </span>
      </div>
    ),
    product: (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg">
          <Package size={14} className="text-primary-500" />
        </div>
        <span className="text-slate-300 text-xs font-bold line-clamp-1">{rev.productName || `Sản phẩm #${rev.productId}`}</span>
      </div>
    ),
    rating: (
        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg w-fit">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-black">{rev.ratingStar}</span>
        </div>
    ),
    comment: (
        <div className="max-w-xs">
          <p className="text-slate-400 text-sm italic line-clamp-2">"{rev.comment}"</p>
        </div>
    ),
    date: (
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
        {new Date(rev.createdAt).toLocaleString('vi-VN')}
      </div>
    )
  }));

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight underline decoration-primary-500 decoration-4 underline-offset-8">Feedback</h1>
            <p className="text-slate-500 text-sm mt-5 italic font-medium">Quản lý hội thoại và lắng nghe ý kiến từ khách hàng <span className="text-white font-bold">Glowzy</span>.</p>
        </div>

        <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit shadow-2xl overflow-x-auto whitespace-nowrap">
            <button 
                onClick={() => setActiveTab('chat')}
                className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === 'chat' ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <Send size={14} />
                <span>Tin nhắn</span>
            </button>
            <button 
                onClick={() => setActiveTab('reviews')}
                className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === 'reviews' ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <Star size={14} />
                <span>Đánh giá ({reviews.length})</span>
            </button>
            <button 
                onClick={() => setActiveTab('suggestions')}
                className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === 'suggestions' ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <MessageSquare size={14} />
                <span>Góp ý ({feedbacks.length})</span>
            </button>
        </div>
      </div>

      <div className="min-h-[500px]">
          {activeTab === 'chat' && <AdminChat />}
          
          {activeTab === 'reviews' && (
              reviews.length === 0 ? (
                  <EmptyState title="Chưa có đánh giá" description="Khách hàng chưa để lại nhận xét nào cho sản phẩm của bạn." icon={Star} />
              ) : (
                  <Table 
                    columns={[
                        { header: "Khách hàng", key: "user" },
                        { header: "Sản phẩm", key: "product" },
                        { header: "Điểm", key: "rating" },
                        { header: "Nhận xét", key: "comment" },
                        { header: "Thời gian", key: "date" }
                    ]} 
                    data={reviewTableData} 
                  />
              )
          )}

          {activeTab === 'suggestions' && (
              feedbacks.length === 0 ? (
                  <EmptyState title="Hộp thư góp ý đang trống" description="Hiện chưa có ý kiến đóng góp nào từ khách hàng." icon={MessageSquare} />
              ) : (
                  <Table 
                    columns={[
                        { header: "Người góp ý", key: "user" },
                        { header: "Nội dung góp ý", key: "message" },
                        { header: "Thời gian", key: "date" },
                        { header: "Thao tác", key: "actions", className: "text-right" }
                    ]} 
                    data={contactTableData} 
                    rowClassName={(item: any) => item.rowClassName}
                    />
              )
          )}
      </div>
    </div>
  );
};

const EmptyState = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center shadow-xl">
        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-700">
            <Icon size={40} className="text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 underline decoration-primary-500 decoration-2 underline-offset-4">{title}</h3>
        <p className="text-slate-500 max-w-xs font-medium italic">{description}</p>
    </div>
);