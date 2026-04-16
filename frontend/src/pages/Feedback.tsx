import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Feedback } from "../types";
import { Table } from "../components/admin/Table";
import { feedbackService } from "../api/feedbackService";
import { reviewService, type Review } from "../api/reviewService";
import { toast } from "react-hot-toast";
import { MessageSquare, User, Mail, Calendar, Star, Package, MessageCircle } from "lucide-react";
import { clsx } from "clsx";

export const FeedbackPage = () => {
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'reviews'>('contacts');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'reviews') {
      setActiveTab('reviews');
    } else {
      setActiveTab('contacts');
    }
  }, [location.search]);

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
    fetchData();
  }, []);

  const contactTableData = feedbacks.map(fb => ({
    user: (
      <div className="flex flex-col">
        <span className="text-white font-bold flex items-center gap-2">
          <User size={12} className="text-slate-500" /> {fb.name}
        </span>
        <span className="text-slate-500 text-[10px] flex items-center gap-2">
          <Mail size={10} /> {fb.email}
        </span>
      </div>
    ),
    email: <span className="text-slate-400 text-sm whitespace-nowrap">{fb.email}</span>,
    message: (
      <div className="max-w-md">
        <p className="text-slate-300 text-sm italic line-clamp-2 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
          "{fb.message}"
        </p>
      </div>
    ),
    date: (
      <div className="text-slate-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
        <Calendar size={12} />
        {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
      </div>
    )
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hộp thư phản hồi</h1>
            <p className="text-slate-500 text-sm mt-1 italic">Lắng nghe ý kiến của khách hàng để cải thiện dịch vụ của Glowzy.</p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
            <button 
                onClick={() => setActiveTab('contacts')}
                className={clsx(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === 'contacts' ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <MessageSquare size={14} />
                <span>Liên hệ ({feedbacks.length})</span>
            </button>
            <button 
                onClick={() => setActiveTab('reviews')}
                className={clsx(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === 'reviews' ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <MessageCircle size={14} />
                <span>Đánh giá ({reviews.length})</span>
            </button>
        </div>
      </div>

      <div className="min-h-[400px]">
          {activeTab === 'contacts' ? (
              feedbacks.length === 0 ? (
                  <EmptyState title="Hộp thư đang trống" description="Hiện chưa có bất kỳ phản hồi liên hệ nào từ khách hàng." icon={MessageSquare} />
              ) : (
                  <Table 
                    columns={[
                        { header: "Khách hàng", key: "user" },
                        { header: "Email", key: "email" },
                        { header: "Nội dung", key: "message" },
                        { header: "Thời gian", key: "date" }
                    ]} 
                    data={contactTableData} 
                    />
              )
          ) : (
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