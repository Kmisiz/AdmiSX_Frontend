import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth";
import { authApi } from "../../apis/auth";
import { dashboardApi, type NotificationData } from "../../apis/dashboard";
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useSocket } from "../../hooks/useSocket";
import logoSrc from "../../assets/hero/logo.jpg";

const NAV_LINKS = [
  { to: "/dashboard", label: "Tổng quan" },
  { to: "/dashboard/admissions", label: "Xét tuyển" },
  { to: "/dashboard/documents", label: "Tài liệu" },
  { to: "/dashboard/notifications", label: "Thông báo" },
];

const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Trang chủ", icon: "home" },
  { href: "/#admissions-process", label: "Quy trình", icon: "route" },
  { href: "/#featured-programs", label: "Chương trình", icon: "school" },
  { href: "/contact", label: "Liên hệ", icon: "support_agent" },
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
  const [activeHash, setActiveHash] = useState(window.location.hash);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

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

  useEffect(() => {
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
    const timeout = window.setTimeout(() => {
      void fetchNotifs();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isAuthenticated, fetchNotifs]);

  const socketHandlers = useMemo(
    () => ({
      "status-changed": fetchNotifs,
    }),
    [fetchNotifs],
  );

  useSocket(socketHandlers);

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

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const isPublicActive = (href: string) => {
    if (href === "/") return location.pathname === "/" && !activeHash;
    if (href.startsWith("/#")) {
      return location.pathname === "/" && activeHash === href.slice(1);
    }
    return location.pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-hairline)] bg-white">
      {avatarMsg && (
        <div
          className={`fixed top-20 right-4 z-[100] px-4 py-3 text-sm font-medium ${
            avatarMsg.type === "ok"
              ? "bg-[var(--color-success)] text-white"
              : "bg-[var(--color-danger)] text-white"
          }`}
        >
          {avatarMsg.text}
        </div>
      )}
      <div className="grid h-[72px] w-full max-w-[1280px] grid-cols-[1fr_auto] items-center gap-4 mx-auto px-4 sm:px-8 md:grid-cols-[1fr_auto_1fr]">
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center justify-start gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex h-[72px] items-center px-1 text-[14px] transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:bg-[var(--color-primary)] after:transition-all after:duration-200 ${
                  isActive(link.to)
                    ? "font-bold text-[var(--color-primary)] after:w-full"
                    : "font-semibold text-[var(--color-charcoal)] after:w-0 hover:font-bold hover:text-[var(--color-ink-deep)] hover:after:w-full hover:after:bg-[var(--color-primary)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center justify-start gap-8">
            {PUBLIC_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative flex h-[72px] items-center px-1 text-[14px] transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:bg-[var(--color-primary)] after:transition-all after:duration-200 ${
                  isPublicActive(link.href)
                    ? "font-bold text-[var(--color-primary)] after:w-full"
                    : "font-semibold text-[var(--color-charcoal)] after:w-0 hover:font-bold hover:text-[var(--color-ink-deep)] hover:after:w-full hover:after:bg-[var(--color-primary)]"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="order-first flex items-center justify-start h-full md:order-none md:justify-center">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3 px-3 py-2 transition-all"
          >
            <img
              alt="AdmiSX Logo"
              className="h-9 w-9 object-contain border border-[var(--color-hairline)] bg-white"
              src={logoSrc}
            />
            <div className="leading-tight">
              <span className="block text-xl font-bold text-[#343A40]">
                AdmiSX
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-[#6c757d] sm:block">
                Tuyển sinh
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-[var(--color-charcoal)] hover:text-[var(--color-ink-deep)] p-2.5 hover:bg-[var(--color-canvas-soft)] transition-all"
                aria-label="Mở menu"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                  }}
                  className="relative text-[var(--color-charcoal)] hover:text-[var(--color-ink-deep)] hover:bg-[var(--color-canvas-soft)] p-2.5 transition-all active:opacity-80 active:scale-95"
                  aria-label="Thông báo"
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--color-danger)] text-white text-[10px] font-bold px-1 leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[var(--color-hairline)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--color-hairline)] flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[var(--color-ink-deep)]">
                        Thông báo
                      </h3>
                      <span className="text-xs text-[var(--color-charcoal)]">
                        {notifications.length} gần đây
                      </span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-[var(--color-charcoal)]">
                          <span className="material-symbols-outlined text-[32px]">
                            notifications_off
                          </span>
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
                              className="w-full text-left px-4 py-3 border-b border-[var(--color-hairline)] last:border-b-0 hover:bg-[var(--color-canvas-soft)] transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`material-symbols-outlined text-[18px] mt-0.5 ${meta.color}`}
                                >
                                  {meta.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-[var(--color-ink-deep)] truncate">
                                    {n.subject}
                                  </p>
                                  <p className="text-[11px] text-[var(--color-charcoal)] mt-0.5 line-clamp-2">
                                    {n.content}
                                  </p>
                                  <span className="text-[10px] text-[var(--color-slate)] mt-1 inline-block">
                                    {formatTimeAgo(n.created_at)}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                    <div className="px-4 py-2.5 border-t border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]">
                      <button
                        onClick={() => {
                          setNotifOpen(false);
                          navigate({ to: "/dashboard/notifications" });
                        }}
                        className="w-full text-center text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-deep)] transition-colors"
                      >
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={dropdownRef}>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-2 border border-transparent px-1.5 py-1.5 transition-all hover:border-[var(--color-hairline)] hover:bg-[var(--color-canvas-soft)] group"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || user.email}
                      className="w-9 h-9 object-cover border border-[var(--color-hairline)]"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-[var(--color-primary)] flex items-center justify-center overflow-hidden border border-[var(--color-hairline)]">
                      <span className="text-white text-sm font-bold">
                        {user?.full_name?.charAt(0) ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                  )}
                  <span className="text-[var(--color-charcoal)] text-sm font-medium hidden sm:block group-hover:text-[var(--color-ink-deep)] transition-colors">
                    {user?.full_name || user?.email || ""}
                  </span>
                  <span className="material-symbols-outlined text-[var(--color-slate)] text-[18px]">
                    arrow_drop_down
                  </span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[var(--color-hairline)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--color-hairline)]">
                      <p className="text-[13px] font-semibold text-[var(--color-ink-deep)] truncate">
                        {user?.full_name || "Người dùng"}
                      </p>
                      <p className="text-[11px] text-[var(--color-charcoal)] truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        avatarInputRef.current?.click();
                      }}
                      disabled={avatarBusy}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[var(--color-ink-deep)] hover:bg-[var(--color-canvas-soft)] transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[var(--color-charcoal)] text-[20px]">
                        upload
                      </span>
                      {avatarBusy
                        ? "Đang tải..."
                        : user?.avatar_url
                          ? "Đổi avatar"
                          : "Tải avatar lên"}
                    </button>
                    {user?.avatar_url && (
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleDeleteAvatar();
                        }}
                        disabled={avatarBusy}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[var(--color-ink-deep)] hover:bg-[var(--color-canvas-soft)] transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[var(--color-charcoal)] text-[20px]">
                          delete
                        </span>
                        Xoá avatar
                      </button>
                    )}
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink-deep)] hover:bg-[var(--color-canvas-soft)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[var(--color-charcoal)] text-[20px]">
                        person
                      </span>
                      Hồ sơ
                    </Link>
                    <hr className="border-[var(--color-hairline)]" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors"
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
                  (window.location.href =
                    (import.meta.env.VITE_ADMIS_URL || window.location.origin) +
                    "/login")
                }
                className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[var(--color-charcoal)] transition-all duration-200 hover:text-[var(--color-ink-deep)] md:inline-flex"
              >
                Đăng nhập
              </button>
              <a
                href={
                  (import.meta.env.VITE_ADMIS_URL || window.location.origin) +
                  "/register"
                }
                className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[var(--color-primary)] transition-all duration-200 hover:text-[var(--color-primary-deep)] md:inline-flex"
              >
                Đăng ký
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-[var(--color-charcoal)] hover:text-[var(--color-ink-deep)] p-2.5 hover:bg-[var(--color-canvas-soft)] transition-all"
                aria-label="Mở menu"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
      <div
        aria-hidden={!mobileOpen}
        className={`md:hidden overflow-hidden border-t border-[var(--color-hairline)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out ${
          mobileOpen
            ? "max-h-[520px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3">
          <nav className="flex flex-col gap-1">
            {isAuthenticated
              ? NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                      isActive(link.to)
                        ? "text-[var(--color-primary)] bg-[#F0F4FF]"
                        : "text-[var(--color-charcoal)] hover:text-[var(--color-ink-deep)] hover:bg-[var(--color-canvas-soft)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))
              : PUBLIC_NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                      isPublicActive(link.href)
                        ? "text-[var(--color-primary)] bg-[#F0F4FF]"
                        : "text-[var(--color-charcoal)] hover:text-[var(--color-ink-deep)] hover:bg-[var(--color-canvas-soft)]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {link.icon}
                    </span>
                    {link.label}
                  </a>
                ))}
          </nav>
          {!isAuthenticated && (
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--color-hairline)] pt-3">
              <button
                onClick={() => {
                  window.location.href =
                    (import.meta.env.VITE_ADMIS_URL || window.location.origin) +
                    "/login";
                }}
                className="border border-[var(--color-hairline)] px-4 py-2.5 text-sm font-bold text-[var(--color-ink)] transition-all duration-200 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-canvas-soft)] active:scale-[0.98]"
              >
                Đăng nhập
              </button>
              <a
                href={
                  (import.meta.env.VITE_ADMIS_URL || window.location.origin) +
                  "/register"
                }
                className="bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-bold text-white transition-all duration-200 hover:bg-[var(--color-primary-dark)] active:scale-[0.98]"
              >
                Đăng ký
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
