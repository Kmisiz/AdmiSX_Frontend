import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { dashboardApi, type NotificationData } from "../apis/dashboard";
import { useSocket } from "../hooks/useSocket";

const getNotificationMeta = (type: string) => {
  switch (type) {
    case "APPLICATION_SUBMITTED":
    case "APPROVAL":
    case "RESULT":
    case "PASSED":
      return { icon: "check_circle", color: "text-[#04844B]" };
    case "REJECTION":
    case "FAILED":
      return { icon: "cancel", color: "text-[#EF4444]" };
    case "PASSWORD_RESET":
      return { icon: "lock", color: "text-[#F97316]" };
    default:
      return { icon: "info", color: "text-[#032D60]" };
  }
};

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Vài phút trước";
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString("vi-VN");
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const res = await dashboardApi.getNotifications({
          page: pageNum,
          limit: 20,
        });
        const data = res.data.data || [];
        const pagination = res.data.pagination;
        if (append) {
          setNotifications((prev) => [...prev, ...data]);
        } else {
          setNotifications(data);
        }
        setHasMore(pagination ? pageNum < pagination.pages : false);
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchNotifications(1);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchNotifications]);

  const refreshFirstPage = useCallback(() => {
    void fetchNotifications(1);
  }, [fetchNotifications]);

  const socketHandlers = useMemo(
    () => ({
      "status-changed": refreshFirstPage,
    }),
    [refreshFirstPage],
  );

  useSocket(socketHandlers);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    void fetchNotifications(nextPage, true);
  };

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

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
      <div className="mb-8">
        <h1 className="text-[32px] sm:text-[40px] font-bold text-[#101828] leading-tight">
          Thông báo
        </h1>
        <p className="text-[16px] text-[#667085] mt-2">
          Các thông báo từ văn phòng tuyển sinh
        </p>
      </div>

      <section className="bg-white border border-[#E4E7EC] rounded-2xl overflow-hidden">
        {notifications.length > 0 ? (
          <div>
            {notifications.map((notif) => {
              const meta = getNotificationMeta(notif.type);
              const isUnread = notif.status === "UNREAD";
              return (
                <button
                  key={notif.id}
                  onClick={() =>
                    navigate({
                      to: "/dashboard/notifications/$id",
                      params: { id: notif.id.toString() },
                    })
                  }
                  className={`w-full flex items-start gap-4 py-5 border-b border-[#E4E7EC] last:border-b-0 text-left transition-colors ${
                    isUnread
                      ? "bg-[#F4F6F9] hover:bg-[#EFF6FF]"
                      : "hover:bg-[#F4F6F9]"
                  } px-6`}
                >
                  <div className="relative flex-shrink-0">
                    <span
                      className={`material-symbols-outlined mt-0.5 ${meta.color}`}
                    >
                      {meta.icon}
                    </span>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#032D60] rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-[15px] ${
                          isUnread ? "font-bold" : "font-semibold"
                        } text-[#101828] truncate`}
                      >
                        {notif.subject}
                      </h3>
                    </div>
                    <p className="text-[13px] text-[#667085] mt-1 line-clamp-2">
                      {notif.content}
                    </p>
                    <span className="text-[11px] text-[#667085] mt-2 inline-block">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#98A2B3] text-[18px] flex-shrink-0">
                    chevron_right
                  </span>
                </button>
              );
            })}
            {hasMore && (
              <div className="px-6 py-4 border-t border-[#E4E7EC]">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-2.5 bg-[#F4F6F9] text-[#475467] rounded-full text-sm font-semibold hover:bg-[#E4E7EC] transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm thông báo"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[#667085] text-[48px]">
              notifications_off
            </span>
            <p className="text-[#667085] text-sm mt-3">Chưa có thông báo nào</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;
