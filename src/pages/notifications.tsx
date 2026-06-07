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
      return { icon: "check_circle", color: "text-[var(--color-success)]" };
    case "REJECTION":
    case "FAILED":
      return { icon: "cancel", color: "text-[var(--color-danger)]" };
    case "PASSWORD_RESET":
      return { icon: "lock", color: "text-[var(--color-warning)]" };
    default:
      return { icon: "info", color: "text-[var(--color-primary)]" };
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

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
      <div className="mb-8">
        <h1 className="text-[32px] sm:text-[40px] font-bold text-[var(--color-ink-deep)] leading-tight">
          Thông báo
        </h1>
        <p className="text-[16px] text-[var(--color-charcoal)] mt-2">
          Các thông báo từ văn phòng tuyển sinh
        </p>
      </div>

      <section className="bg-white border border-[var(--color-hairline)] rounded overflow-hidden">
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
                  className={`w-full flex items-start gap-4 py-5 border-b border-[var(--color-hairline)] last:border-b-0 text-left transition-colors ${
                    isUnread
                      ? "bg-[var(--color-canvas-soft)] hover:bg-[var(--color-primary-soft)]"
                      : "hover:bg-[var(--color-canvas-soft)]"
                  } px-6`}
                >
                  <div className="relative flex-shrink-0">
                    <span
                      className={`material-symbols-outlined mt-0.5 ${meta.color}`}
                    >
                      {meta.icon}
                    </span>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-[15px] ${
                          isUnread ? "font-bold" : "font-semibold"
                        } text-[var(--color-ink-deep)] truncate`}
                      >
                        {notif.subject}
                      </h3>
                    </div>
                    <p className="text-[13px] text-[var(--color-charcoal)] mt-1 line-clamp-2">
                      {notif.content}
                    </p>
                    <span className="text-[11px] text-[var(--color-charcoal)] mt-2 inline-block">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[var(--color-slate)] text-[18px] flex-shrink-0">
                    chevron_right
                  </span>
                </button>
              );
            })}
            {hasMore && (
              <div className="px-6 py-4 border-t border-[var(--color-hairline)]">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-2.5 bg-[var(--color-canvas-soft)] text-[var(--color-ink)] rounded text-sm font-semibold hover:bg-[var(--color-hairline)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm thông báo"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[var(--color-charcoal)] text-[48px]">
              notifications_off
            </span>
            <p className="text-[var(--color-charcoal)] text-sm mt-3">
              Chưa có thông báo nào
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;
