import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth";
import {
  dashboardApi,
  type DeadlineData,
  type CompletenessData,
  type NotificationData,
} from "../apis/dashboard";
import { useSocket } from "../hooks/useSocket";

const PERSONAL_FIELDS = [
  "Số điện thoại",
  "Ngày sinh",
  "Giới tính",
  "Tỉnh/Thành phố",
  "Địa chỉ",
];
const ACADEMIC_FIELDS = ["Năm tốt nghiệp", "Trường THPT (lớp 12)"];
const EXAM_SCORE_FIELDS = [
  "Điểm thi phải đủ đúng 4 môn",
  "Điểm thi bắt buộc có TOÁN và VĂN",
  "2 môn tự chọn chưa hợp lệ",
  "Thiếu thông tin ngoại ngữ cho môn NGOAINGU",
  "Dữ liệu ngoại ngữ không khớp môn đã chọn",
];
const CERTIFICATE_FIELDS = ["Giấy chứng nhận kết quả thi"];

type SectionStatus = "completed" | "pending" | "not_started";

const SectionStatusBadge = ({
  status,
  label,
}: {
  status: SectionStatus;
  label: string;
}) => {
  const config = {
    completed: {
      icon: "check_circle",
      fill: true,
      color: "text-[#04844B]",
      text: "Hoàn thành",
    },
    pending: {
      icon: "pending",
      fill: false,
      color: "text-[#F97316]",
      text: "Đang xử lý",
    },
    not_started: {
      icon: "circle",
      fill: false,
      color: "text-[#667085]",
      text: "Chưa bắt đầu",
    },
  };
  const cfg = config[status];
  return (
    <div className="bg-[#F4F6F9] p-4 rounded-xl flex flex-col gap-1">
      <span className="text-sm text-[#667085]">{label}</span>
      <div className={`flex items-center gap-2 ${cfg.color}`}>
        <span
          className="material-symbols-outlined text-lg"
          style={
            cfg.fill
              ? {
                  fontVariationSettings:
                    "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }
              : {}
          }
        >
          {cfg.icon}
        </span>
        <span className="text-[13px] font-semibold">{cfg.text}</span>
      </div>
    </div>
  );
};

const PrivateDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [deadline, setDeadline] = useState<DeadlineData | null>(null);
  const [completeness, setCompleteness] = useState<CompletenessData | null>(
    null,
  );
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const safe = <T,>(
    p: Promise<{ data: { data: T } }>,
    fallback: T,
  ): Promise<T> => p.then((r) => r.data.data).catch(() => fallback);

  useEffect(() => {
    const fetchData = async () => {
      const [dl, comp, notifs] = await Promise.all([
        safe(dashboardApi.getDeadline(), null as unknown as DeadlineData),
        safe(
          dashboardApi.getCompleteness(),
          null as unknown as CompletenessData,
        ),
        safe(dashboardApi.getNotifications({ limit: 5 }), []),
      ]);

      setDeadline(dl);
      setCompleteness(comp);
      setNotifications(notifs);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!deadline || deadline.status !== "during" || !deadline.end_date) return;

    const parseDDMMYYYY = (s: string) => {
      const [d, m, y] = s.split("/").map(Number);
      return new Date(y, m - 1, d);
    };

    const tick = () => {
      const now = new Date();
      const end = parseDDMMYYYY(deadline.end_date);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Đã kết thúc");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(
          `Còn ${days} ngày ${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
        );
      } else {
        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
        );
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const refreshNotifications = useCallback(async () => {
    const notifs = await safe(dashboardApi.getNotifications({ limit: 5 }), []);
    setNotifications(notifs);
  }, []);

  const socketHandlers = useMemo(
    () => ({
      "status-changed": refreshNotifications,
    }),
    [refreshNotifications],
  );

  useSocket(socketHandlers);

  // Backend early-returns if profile or academic record is missing, so
  // missing_fields won't contain the granular fields below in that case.
  // Treat those as pending for all dependent sections.
  const missing = completeness?.missing_fields ?? [];
  const profileNotCreated = missing.includes("Hồ sơ cá nhân chưa được tạo");
  const academicNotCreated =
    profileNotCreated ||
    missing.includes("Thông tin học tập (chưa có bảng điểm)");

  const getSectionStatus = (fields: string[]): SectionStatus => {
    if (fields.some((f) => missing.includes(f))) return "pending";
    if (fields.length > 0) return "completed";
    return "not_started";
  };

  const personalComplete: SectionStatus = profileNotCreated
    ? "pending"
    : getSectionStatus(PERSONAL_FIELDS);
  const academicComplete: SectionStatus = academicNotCreated
    ? "pending"
    : getSectionStatus(ACADEMIC_FIELDS);
  const examComplete: SectionStatus = academicNotCreated
    ? "pending"
    : getSectionStatus(EXAM_SCORE_FIELDS);
  const docsComplete: SectionStatus = profileNotCreated
    ? "pending"
    : getSectionStatus(CERTIFICATE_FIELDS);

  const sections = [
    personalComplete,
    academicComplete,
    examComplete,
    docsComplete,
  ];
  const completedCount = sections.filter((s) => s === "completed").length;
  const progress = Math.round((completedCount / 4) * 100);

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

  const getDeadlineDate = (dateStr: string) => {
    const [day, month] = dateStr.split("/");
    return { day, month };
  };

  const getDeadlineLabel = (days: number | null, status: string) => {
    if (status === "after") return "Đã kết thúc";
    if (status === "before") return "Sắp diễn ra";
    if (days === null) return "Đang cập nhật";
    if (days === 0) return "Hôm nay";
    if (days === 1) return "Còn 1 ngày";
    return `Còn ${days} ngày nữa`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[#032D60] animate-spin text-[40px]">
            progress_activity
          </span>
          <p className="text-[#667085] text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const deadlineDate = deadline ? getDeadlineDate(deadline.end_date) : null;

  const isUrgentDeadline =
    deadline &&
    deadline.status === "during" &&
    deadline.days_remaining !== null &&
    deadline.days_remaining <= 7;
  const isPastDeadline = deadline && deadline.status === "after";

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-[32px] sm:text-[40px] font-bold text-[#101828] leading-tight">
          Xin chào, {user?.full_name || user?.email || "Thí sinh"}
        </h1>
        <p className="text-[16px] text-[#667085] mt-2">
          Chào mừng bạn quay trở lại cổng tuyển sinh AdmiSX.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Progress Card */}
        <section className="bg-white border border-[#E4E7EC] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#101828]">
              Tiến độ hoàn thiện hồ sơ
            </h2>
            <span className="text-2xl font-bold text-[#032D60]">
              {progress}%
            </span>
          </div>

          <div className="h-3 bg-[#E4E7EC] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#032D60] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <SectionStatusBadge
              status={personalComplete}
              label="Thông tin cá nhân"
            />
            <SectionStatusBadge
              status={academicComplete}
              label="Hồ sơ học tập"
            />
            <SectionStatusBadge status={examComplete} label="Điểm thi" />
            <SectionStatusBadge status={docsComplete} label="Chứng chỉ" />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => navigate({ to: "/dashboard/admissions" })}
              className="bg-[#2563EB] text-white h-[52px] px-7 rounded-full font-semibold text-[15px] hover:bg-[#1D4ED8] transition-all active:scale-95 flex items-center gap-2"
            >
              Tiếp tục hoàn thiện
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>
          </div>
        </section>

        {/* Deadline Card */}
        <section className="bg-white border border-[#E4E7EC] rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-bold text-[#101828] mb-6">
            Hạn chót quan trọng
          </h2>

          {deadline && deadlineDate ? (
            <div className="flex-1 flex flex-col gap-5">
              <div className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center ${
                    isPastDeadline
                      ? "bg-[#F4F6F9] text-[#667085]"
                      : isUrgentDeadline
                        ? "bg-[#FEE2E2] text-[#EF4444]"
                        : "bg-[#032D60]/10 text-[#032D60]"
                  }`}
                >
                  <span className="font-bold text-lg leading-none">
                    {deadlineDate.day}
                  </span>
                  <span className="text-[10px] font-medium leading-tight">
                    THG {deadlineDate.month}
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[15px] font-semibold text-[#101828]">
                    Nộp hồ sơ đợt 1
                  </span>
                  <span className="text-[13px] text-[#667085] mt-0.5">
                    {deadline.status === "during" && timeRemaining
                      ? timeRemaining
                      : getDeadlineLabel(
                          deadline.days_remaining,
                          deadline.status,
                        )}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center bg-[#F4F6F9] text-[#667085]">
                  <span className="font-bold text-lg leading-none">
                    {deadlineDate.day}
                  </span>
                  <span className="text-[10px] font-medium leading-tight">
                    THG {deadlineDate.month}
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[15px] font-semibold text-[#101828]">
                    Bổ sung minh chứng
                  </span>
                  <span className="text-[13px] text-[#667085] mt-0.5">
                    {deadline.status === "during"
                      ? "Sau khi nộp hồ sơ"
                      : deadline.status === "before"
                        ? "Sắp tới"
                        : "Đã kết thúc"}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <a
                  href="#"
                  className="text-[#032D60] text-[13px] font-medium hover:underline flex items-center gap-1"
                >
                  Xem tất cả lịch trình
                  <span className="material-symbols-outlined text-[16px]">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#667085] text-sm">
                Chưa có thông tin hạn chót
              </p>
            </div>
          )}
        </section>

        {/* Notifications Card */}
        <section className="bg-white border border-[#E4E7EC] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-[#101828]">
              Thông báo từ văn phòng tuyển sinh
            </h2>
            {notifications.length > 0 && (
              <span className="bg-[#032D60]/10 text-[#032D60] px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {notifications.length > 1
                  ? `${notifications.length} mới`
                  : "Mới"}
              </span>
            )}
          </div>

          {notifications.length > 0 ? (
            <div>
              {notifications.map((notif) => {
                const meta = getNotificationMeta(notif.type);
                return (
                  <button
                    key={notif.id}
                    onClick={() =>
                      navigate({
                        to: "/dashboard/notifications/$id",
                        params: { id: notif.id.toString() },
                      })
                    }
                    className="w-full flex items-start gap-4 py-5 border-b border-[#E4E7EC] last:border-b-0 cursor-pointer hover:bg-[#F4F6F9] -mx-6 px-6 transition-colors group text-left"
                  >
                    <span
                      className={`material-symbols-outlined mt-0.5 ${meta.color}`}
                    >
                      {meta.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-[#101828] group-hover:text-[#032D60] transition-colors truncate">
                        {notif.subject}
                      </h3>
                      <p className="text-[13px] text-[#667085] mt-1 line-clamp-2">
                        {notif.content}
                      </p>
                      <span className="text-[11px] text-[#667085] mt-2 inline-block">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-[#667085] text-[40px]">
                notifications_off
              </span>
              <p className="text-[#667085] text-sm mt-3">
                Chưa có thông báo nào
              </p>
            </div>
          )}
          {notifications.length > 0 && (
            <div className="border-t border-[#E4E7EC] px-6 py-3">
              <Link
                to="/dashboard/notifications"
                className="flex items-center justify-center gap-1 text-[13px] font-medium text-[#032D60] hover:text-[#021a40] transition-colors"
              >
                Xem tất cả thông báo
                <span className="material-symbols-outlined text-[16px]">
                  arrow_right_alt
                </span>
              </Link>
            </div>
          )}
        </section>

        {/* Quick Access Card */}
        <section className="bg-white border border-[#E4E7EC] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#101828] mb-6">
            Truy cập nhanh
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/dashboard/documents"
              className="h-[110px] border border-[#D0D5DD] rounded-xl bg-white flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-[#032D60] hover:shadow-[0_4px_12px_rgba(3,45,96,0.12)] group"
            >
              <span className="material-symbols-outlined text-[#032D60] text-[32px] group-hover:scale-110 transition-transform">
                description
              </span>
              <span className="text-[13px] font-medium text-[#101828] text-center">
                Tải lên tài liệu
              </span>
            </Link>
            <a
              href="#"
              className="h-[110px] border border-[#D0D5DD] rounded-xl bg-white flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-[#032D60] hover:shadow-[0_4px_12px_rgba(3,45,96,0.12)] group"
            >
              <span className="material-symbols-outlined text-[#032D60] text-[32px] group-hover:scale-110 transition-transform">
                contact_support
              </span>
              <span className="text-[13px] font-medium text-[#101828] text-center">
                Hỗ trợ trực tuyến
              </span>
            </a>
            <Link
              to="/dashboard/notifications"
              className="h-[110px] border border-[#D0D5DD] rounded-xl bg-white flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-[#032D60] hover:shadow-[0_4px_12px_rgba(3,45,96,0.12)] group"
            >
              <span className="material-symbols-outlined text-[#032D60] text-[32px] group-hover:scale-110 transition-transform">
                history_edu
              </span>
              <span className="text-[13px] font-medium text-[#101828] text-center">
                Lịch sử nộp hồ sơ
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivateDashboard;
