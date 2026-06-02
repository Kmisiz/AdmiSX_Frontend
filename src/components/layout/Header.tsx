import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth";
import { authApi } from "../../apis/auth";
import { dashboardApi, type NotificationData } from "../../apis/dashboard";
import { useCallback, useState, useRef, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import logoSrc from "../../assets/hero/logo.jpg";

const NAV_LINKS = [
  { to: "/dashboard", label: "Bảng điều khiển" },
  { to: "/dashboard/admissions", label: "Tuyển sinh" },
  { to: "/dashboard/documents", label: "Tài liệu" },
  { to: "/dashboard/notifications", label: "Thông báo" },
];

const Header = () => {
  const { isAuthenticated, user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setShowDropdown(false);
    logout();
    navigate({ to: "/" });
  }, [logout, navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarMsg({ type: "err", text: "Vui lòng chọn file ảnh" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg({ type: "err", text: "Ảnh tối đa 5MB" });
      return;
    }
    setAvatarBusy(true);
    try {
      const res = await authApi.uploadAvatar(file);
      if (res.success && res.data) {
        setUser(res.data);
        setAvatarMsg({ type: "ok", text: "Cập nhật avatar thành công" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload thất bại";
      setAvatarMsg({ type: "err", text: msg });
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarBusy(true);
    try {
      const res = await authApi.deleteAvatar();
      if (res.success && res.data) {
        setUser(res.data);
        setAvatarMsg({ type: "ok", text: "Đã xoá avatar" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xoá thất bại";
      setAvatarMsg({ type: "err", text: msg });
    } finally {
      setAvatarBusy(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!avatarMsg) return;
    const t = setTimeout(() => setAvatarMsg(null), 3000);
    return () => clearTimeout(t);
  }, [avatarMsg]);

  const fetchNotifs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await dashboardApi.getNotifications({ limit: 50 });
      const items = res.data.data || [];
      setUnreadCount(items.filter((n) => n.status === "UNREAD").length);
      setNotifications(items.slice(0, 5));
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifs();
  }, [isAuthenticated, fetchNotifs]);

  useSocket({
    'status-changed': fetchNotifs,
  });

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

  const getNotifMeta = (type: string) => {
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-50">
      {avatarMsg && (
        <div
          className={`fixed top-20 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            avatarMsg.type === "ok"
              ? "bg-[#04844B] text-white"
              : "bg-[#EF4444] text-white"
          }`}
        >
          {avatarMsg.text}
        </div>
      )}
      <div className="flex justify-between items-center h-[72px] w-full max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-6 h-full">
          <Link to="/" className="flex items-center gap-4">
            <img
              alt="AdmiSX Logo"
              className="h-8 w-8 object-contain rounded-lg"
              src={logoSrc}
            />
            <span className="text-xl font-bold text-[#101828] leading-tight">
              AdmiSX
            </span>
          </Link>
          {isAuthenticated && (
            <nav className="hidden md:flex h-full gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[15px] font-medium transition-colors h-full flex items-center border-b-2 ${
                    isActive(link.to)
                      ? "text-[#032D60] border-[#032D60]"
                      : "text-[#667085] hover:text-[#101828] border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-[#667085] hover:text-[#101828] p-2 rounded-lg hover:bg-[#F4F6F9] transition-all"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); }}
                  className="relative text-[#667085] hover:text-[#101828] hover:bg-[#F4F6F9] p-2 rounded-full transition-all active:opacity-80 active:scale-95"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#EF4444] text-white text-[10px] font-bold rounded-full px-1 leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-[#E4E7EC] shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#E4E7EC] flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#101828]">Thông báo</h3>
                      <span className="text-xs text-[#667085]">{notifications.length} gần đây</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-[#667085]">
                          <span className="material-symbols-outlined text-[32px]">notifications_off</span>
                          <p className="text-xs mt-2">Chưa có thông báo nào</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const meta = getNotifMeta(n.type);
                          return (
                            <button
                              key={n.id}
                              onClick={() => {
                                setNotifOpen(false);
                                navigate({
                                  to: "/dashboard/notifications/$id",
                                  params: { id: n.id.toString() },
                                });
                              }}
                              className="w-full text-left px-4 py-3 border-b border-[#E4E7EC] last:border-b-0 hover:bg-[#F4F6F9] transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <span className={`material-symbols-outlined text-[18px] mt-0.5 ${meta.color}`}>
                                  {meta.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-[#101828] truncate">{n.subject}</p>
                                  <p className="text-[11px] text-[#667085] mt-0.5 line-clamp-2">{n.content}</p>
                                  <span className="text-[10px] text-[#98A2B3] mt-1 inline-block">{formatTimeAgo(n.created_at)}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                    <div className="px-4 py-2.5 border-t border-[#E4E7EC] bg-[#F4F6F9]">
                      <button
                        onClick={() => { setNotifOpen(false); navigate({ to: "/dashboard/notifications" }); }}
                        className="w-full text-center text-xs font-bold text-[#032D60] hover:text-[#021a40] transition-colors"
                      >
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || user.email}
                      className="w-8 h-8 rounded-full object-cover border border-[#E4E7EC]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#032D60] flex items-center justify-center overflow-hidden border border-[#E4E7EC]">
                      <span className="text-white text-sm font-bold">
                        {user?.full_name?.charAt(0) ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                  )}
                  <span className="text-[#475467] text-sm font-medium hidden sm:block group-hover:text-[#101828] transition-colors">
                    {user?.full_name || user?.email || ""}
                  </span>
                  <span className="material-symbols-outlined text-[#98A2B3] text-[18px]">
                    arrow_drop_down
                  </span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E4E7EC] shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#E4E7EC]">
                      <p className="text-[13px] font-semibold text-[#101828] truncate">
                        {user?.full_name || "Người dùng"}
                      </p>
                      <p className="text-[11px] text-[#667085] truncate">
                        {user?.email}
                      </p>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        avatarInputRef.current?.click();
                      }}
                      disabled={avatarBusy}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[#101828] hover:bg-[#F4F6F9] transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[#667085] text-[20px]">
                        upload
                      </span>
                      {avatarBusy ? "Đang tải..." : user?.avatar_url ? "Đổi avatar" : "Tải avatar lên"}
                    </button>
                    {user?.avatar_url && (
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleDeleteAvatar();
                        }}
                        disabled={avatarBusy}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[#101828] hover:bg-[#F4F6F9] transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[#667085] text-[20px]">
                          delete
                        </span>
                        Xoá avatar
                      </button>
                    )}
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#101828] hover:bg-[#F4F6F9] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#667085] text-[20px]">
                        person
                      </span>
                      Hồ sơ
                    </Link>
                    <hr className="border-[#E4E7EC]" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        logout
                      </span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  window.location.href =
                    (import.meta.env.VITE_ADMIS_URL || window.location.origin) +
                    "/login"
                }
                className="text-[#475467] text-sm font-medium hover:text-[#101828] transition-colors cursor-pointer"
              >
                Đăng nhập
              </button>
              <a
                href={
                  (import.meta.env.VITE_ADMIS_URL || window.location.origin) +
                  "/register"
                }
                className="bg-[#032D60] text-white font-semibold px-6 py-2 rounded-full shadow-sm hover:bg-[#021a40] transition-all cursor-pointer active:scale-95 text-sm"
              >
                Đăng ký
              </a>
            </>
          )}
        </div>
      </div>
      {/* Mobile nav drawer */}
      {isAuthenticated && mobileOpen && (
        <div className="md:hidden border-t border-[#E4E7EC] bg-white px-4 py-3 shadow-lg">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`text-[15px] font-medium px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? "text-[#032D60] bg-[#F0F4FF]"
                    : "text-[#667085] hover:text-[#101828] hover:bg-[#F4F6F9]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
