import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Feedback } from "../types";
import { Table } from "../components/admin/Table";
import { feedbackService } from "../api/feedbackService";
import { reviewService, type Review } from "../api/reviewService";
import { toast } from "react-hot-toast";
import { MessageSquare, User, Mail, Calendar, Star, Package, Trash2, Check, Send, Edit2 } from "lucide-react";
import { clsx } from "clsx";
import AdminChat from "../components/admin/AdminChat";
import { chatService } from "../api/chatService";

type FeedbackTab = 'chat' | 'reviews' | 'suggestions';

export const FeedbackPage = () => {
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FeedbackTab>('chat');
  const [previousMaxId] = useState(() => Number(localStorage.getItem('admin_last_seen_feedback_id') || 0));
  const [previousMaxReviewId] = useState(() => Number(localStorage.getItem('admin_last_seen_review_id') || 0));
  
  const [showChatBadge, setShowChatBadge] = useState(false);
  const [showRevBadge, setShowRevBadge] = useState(false);
  const [showSugBadge, setShowSugBadge] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchData = async () => {
    try {
      const [contactRes, reviewRes, chatUsers] = await Promise.all([
        feedbackService.getAllFeedbacks(),
        reviewService.getAllReviews(),
        chatService.getChatUsers()
      ]);

      const sortedFeedbacks = contactRes.sort((a: any, b: any) => b.id - a.id);
      const sortedReviews = reviewRes.data.data.sort((a: any, b: any) => b.id - a.id);

      setFeedbacks(sortedFeedbacks);
      setReviews(sortedReviews);

      // Handle Suggestions badge state
      if (contactRes && contactRes.length > 0) {
        const currentMaxId = Math.max(...contactRes.map((f: any) => f.id));
        const storedMaxId = Number(localStorage.getItem('admin_last_seen_feedback_id') || 0);
        if (currentMaxId > storedMaxId) {
          setShowSugBadge(true);
          localStorage.setItem('admin_last_seen_feedback_id', currentMaxId.toString());
        }
      }

      // Handle Reviews badge state
      if (reviewRes.data.data && reviewRes.data.data.length > 0) {
        const unrepliedReviews = reviewRes.data.data.filter((r: any) => !r.adminReply);
        if (unrepliedReviews.length > 0) {
          setShowRevBadge(true);
        } else {
          setShowRevBadge(false);
        }
      }

      // Handle Chat badge state
      if (chatUsers.some((c: any) => c.unreadCount > 0)) {
        setShowChatBadge(true);
      } else {
        setShowChatBadge(false);
      }

      window.dispatchEvent(new CustomEvent('admin-feedback-seen'));
    } catch (error) {
      toast.error("Không thể tải dữ liệu phản hồi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('admin-chat-seen', fetchData);
    window.addEventListener('admin-feedback-seen', fetchData);
    
    // Global reload listener
    const handleGlobalReload = () => {
      fetchData();
    };
    window.addEventListener('admin-reload-data', handleGlobalReload);

    return () => {
      window.removeEventListener('admin-chat-seen', fetchData);
      window.removeEventListener('admin-feedback-seen', fetchData);
      window.removeEventListener('admin-reload-data', handleGlobalReload);
    };
  }, []);

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

  const handleReply = async (reviewId: number) => {
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setSubmittingReply(true);
    try {
      await reviewService.replyToReview(reviewId, { reply: replyContent });
      toast.success("Đã gửi phản hồi");
      setReplyingTo(null);
      setReplyContent("");
      fetchData();
    } catch (error) {
      toast.error("Không thể gửi phản hồi");
    } finally {
      setSubmittingReply(false);
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
          {fb.id > previousMaxId && !fb.isRead && (
            <span className="px-1.5 py-0.5 bg-primary-500 text-white text-[8px] font-black uppercase rounded-md animate-pulse">
              Mới
            </span>
          )}
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
    rowClassName: clsx(
      !fb.isRead && "bg-primary-500/[0.03]",
      fb.id > previousMaxId && "border-l-2 border-l-primary-500"
    )
  }));

  const reviewTableData = reviews.map(rev => ({
    user: (
      <div className="flex flex-col">
        <span className="text-white font-bold flex items-center gap-2 text-sm">
          <User size={12} className="text-slate-500" /> {rev.userFullName}
          {rev.id > previousMaxReviewId && !rev.adminReply && (
            <span className="px-1.5 py-0.5 bg-primary-500 text-white text-[8px] font-black uppercase rounded-md animate-pulse">
              Mới
            </span>
          )}
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
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg w-fit">
                <Star size={12} fill="currentColor" />
                <span className="text-xs font-black">{rev.ratingStar}</span>
            </div>
            {rev.isEdited && (
              <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest italic bg-primary-500/10 px-2 py-1 rounded-lg border border-primary-500/20">
                (Đã chỉnh sửa)
              </span>
            )}
        </div>
    ),
    comment: (
        <div className="w-full space-y-4">
          <p className="text-slate-400 text-sm italic font-medium leading-relaxed bg-slate-800/20 p-4 rounded-xl border border-slate-800/50 w-full">
            "{rev.comment}"
          </p>
          
          {replyingTo === rev.id ? (
            <div className="ml-6 space-y-3 p-4 bg-slate-800/50 rounded-2xl border border-primary-500/30 animate-in slide-in-from-top-1 duration-300">
                <textarea 
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập nội dung phản hồi khách hàng..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none min-h-[80px] resize-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1.5 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                      onClick={() => handleReply(rev.id)}
                      disabled={submittingReply}
                      className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {submittingReply ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={12} />}
                        {rev.adminReply ? "Cập nhật" : "Gửi phản hồi"}
                    </button>
                </div>
            </div>
          ) : rev.adminReply ? (
            <div className="ml-6 p-4 bg-primary-50/5 border border-primary-500/10 rounded-2xl relative group/reply">
                 <div className="absolute -left-3 top-4 w-3 h-px bg-primary-500/20"></div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-primary-500 rounded flex items-center justify-center">
                        <Check size={10} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                        Admin đã phản hồi
                    </span>
                 </div>
                 <p className="text-slate-300 text-xs italic">"{rev.adminReply}"</p>
                 <button 
                  onClick={() => {
                    setReplyingTo(rev.id);
                    setReplyContent(rev.adminReply || "");
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-primary-500 rounded-lg shadow-sm border border-primary-500/10 transition-all hover:scale-110 active:scale-95"
                  title="Chỉnh sửa phản hồi"
                 >
                    <Edit2 size={12} />
                 </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setReplyingTo(rev.id);
                setReplyContent("");
              }}
              className="ml-6 flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-all text-[10px] font-black uppercase tracking-widest group"
            >
                <div className="w-6 h-6 rounded-full bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <MessageSquare size={12} />
                </div>
                Trả lời khách hàng ngay
            </button>
          )}
        </div>
    ),
    date: (
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
        {new Date(rev.createdAt).toLocaleString('vi-VN')}
      </div>
    ),
    rowClassName: !rev.adminReply ? "bg-primary-500/[0.03] border-l-2 border-l-primary-500" : ""
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
                onClick={() => {
                  setActiveTab('chat');
                }}
                className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative",
                    activeTab === 'chat' ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <Send size={14} />
                <span>Tin nhắn</span>
                {showChatBadge && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[#0f172a] shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                )}
            </button>
            <button 
                onClick={() => {
                  setActiveTab('reviews');
                  setShowRevBadge(false);
                }}
                className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative",
                    activeTab === 'reviews' ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <Star size={14} />
                <span>Đánh giá ({reviews.length})</span>
                {showRevBadge && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[#0f172a] shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                )}
            </button>
            <button 
                onClick={() => {
                  setActiveTab('suggestions');
                  setShowSugBadge(false);
                }}
                className={clsx(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative",
                    activeTab === 'suggestions' ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20" : "text-slate-500 hover:text-white"
                )}
            >
                <MessageSquare size={14} />
                <span>Góp ý ({feedbacks.length})</span>
                {showSugBadge && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[#0f172a] shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                )}
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
                    rowClassName={(item: any) => item.rowClassName}
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