import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { dashboardApi, type NotificationData } from "../apis/dashboard";

const NOTIFICATION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  APPLICATION_SUBMITTED: { label: "Đã nộp hồ sơ", color: "bg-[#04844B]/10 text-[#04844B]" },
  APPROVAL: { label: "Đã duyệt", color: "bg-[#04844B]/10 text-[#04844B]" },
  REJECTION: { label: "Bị từ chối", color: "bg-[#EF4444]/10 text-[#EF4444]" },
  RESULT: { label: "Kết quả", color: "bg-[#032D60]/10 text-[#032D60]" },
  PASSED: { label: "Đỗ", color: "bg-[#04844B]/10 text-[#04844B]" },
  FAILED: { label: "Trượt", color: "bg-[#EF4444]/10 text-[#EF4444]" },
  PASSWORD_RESET: { label: "Mật khẩu", color: "bg-[#F97316]/10 text-[#F97316]" },
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/dashboard/notifications/$id" });
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await dashboardApi.getNotificationById(Number(id));
        setNotification(res.data.data);
        // Mark as read
        await dashboardApi.markNotificationRead(Number(id));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[#032D60] animate-spin text-[40px]">
            progress_activity
          </span>
          <p className="text-[#667085] text-sm">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[#667085] text-[48px]">
            notifications_off
          </span>
          <p className="text-[#667085] text-sm mt-3">
            Không tìm thấy thông báo
          </p>
          <button
            onClick={() => navigate({ to: "/dashboard/notifications" })}
            className="mt-4 px-6 py-2.5 bg-[#032D60] text-white rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const typeMeta = NOTIFICATION_TYPE_LABELS[notification.type] || {
    label: notification.type,
    color: "bg-[#032D60]/10 text-[#032D60]",
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
      <button
        onClick={() => navigate({ to: "/dashboard/notifications" })}
        className="flex items-center gap-2 text-[#667085] hover:text-[#101828] transition-colors mb-6 text-sm font-medium"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Quay lại danh sách
      </button>

      <section className="bg-white border border-[#E4E7EC] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E4E7EC] bg-[#F4F6F9]">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${typeMeta.color}`}
            >
              {typeMeta.label}
            </span>
            <span className="text-[12px] text-[#667085]">
              {formatDateTime(notification.created_at)}
            </span>
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#101828] leading-tight">
            {notification.subject}
          </h1>
        </div>
        <div className="p-6">
          <p className="text-[15px] text-[#344054] leading-relaxed whitespace-pre-line">
            {notification.content}
          </p>
        </div>
      </section>
    </div>
  );
};

export default NotificationDetailPage;
