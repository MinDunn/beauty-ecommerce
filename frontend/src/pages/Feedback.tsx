import { useState, useEffect } from "react";
import type { Feedback } from "../types";
import { Table } from "../components/admin/Table";
import { feedbackService } from "../api/feedbackService";
import { toast } from "react-hot-toast";
import { MessageSquare, User, Mail, Calendar } from "lucide-react";

export const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackService.getAllFeedbacks();
      setFeedbacks(response);
    } catch (error) {
      toast.error("Không thể tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const tableData = feedbacks.map(fb => ({
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

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hộp thư phản hồi</h1>
        <p className="text-slate-500 text-sm mt-1 italic">Lắng nghe ý kiến của khách hàng để cải thiện dịch vụ của Glowzy.</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center shadow-xl">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-700">
            <MessageSquare size={40} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 underline decoration-primary-500 decoration-2 underline-offset-4">Hộp thư đang trống</h3>
          <p className="text-slate-500 max-w-xs font-medium italic">Hiện chưa có bất kỳ phản hồi nào từ khách hàng của Glowzy.</p>
        </div>
      ) : (
        <Table 
          columns={[
            { header: "Khách hàng", key: "user" },
            { header: "Email", key: "email" },
            { header: "Nội dung", key: "message" },
            { header: "Thời gian", key: "date" }
          ]} 
          data={tableData} 
        />
      )}
    </div>
  );
};