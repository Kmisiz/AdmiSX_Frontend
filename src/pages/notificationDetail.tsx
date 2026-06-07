import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { dashboardApi, type NotificationData } from "../apis/dashboard";

const NOTIFICATION_TYPE_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  APPLICATION_SUBMITTED: {
    label: "Đã nộp hồ sơ",
    color: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  },
  APPROVAL: {
    label: "Đã duyệt",
    color: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  },
  REJECTION: {
    label: "Bị từ chối",
    color: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  },
  RESULT: {
    label: "Kết quả",
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  },
  PASSED: {
    label: "Đỗ",
    color: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  },
  FAILED: {
    label: "Trượt",
    color: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  },
  PASSWORD_RESET: {
    label: "Mật khẩu",
    color: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  },
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
  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );
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
          <span className="material-symbols-outlined text-[var(--color-primary)] animate-spin text-[40px]">
            progress_activity
          </span>
          <p className="text-[var(--color-charcoal)] text-sm">
            Đang tải thông báo...
          </p>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
        <div className="bg-white border border-[var(--color-hairline)] rounded p-12 text-center">
          <span className="material-symbols-outlined text-[var(--color-charcoal)] text-[48px]">
            notifications_off
          </span>
          <p className="text-[var(--color-charcoal)] text-sm mt-3">
            Không tìm thấy thông báo
          </p>
          <button
            onClick={() => navigate({ to: "/dashboard/notifications" })}
            className="mt-4 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-all active:scale-95"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const typeMeta = NOTIFICATION_TYPE_LABELS[notification.type] || {
    label: notification.type,
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
      <button
        onClick={() => navigate({ to: "/dashboard/notifications" })}
        className="flex items-center gap-2 text-[var(--color-charcoal)] hover:text-[var(--color-ink-deep)] transition-colors mb-6 text-sm font-medium"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Quay lại danh sách
      </button>

      <section className="bg-white border border-[var(--color-hairline)] rounded overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`px-3 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${typeMeta.color}`}
            >
              {typeMeta.label}
            </span>
            <span className="text-[12px] text-[var(--color-charcoal)]">
              {formatDateTime(notification.created_at)}
            </span>
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--color-ink-deep)] leading-tight">
            {notification.subject}
          </h1>
        </div>
        <div className="p-6">
          <p className="text-[15px] text-[var(--color-ink)] leading-relaxed whitespace-pre-line">
            {notification.content}
          </p>
        </div>
      </section>
    </div>
  );
};

export default NotificationDetailPage;
