import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "../../store/auth";
import { authApi } from "../../apis/auth";
import { useCallback, useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { to: "/dashboard", label: "Bảng điều khiển" },
  { to: "/dashboard/admissions", label: "Tuyển sinh" },
  { to: "/documents", label: "Tài liệu" },
];

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#002B5B] sticky top-0 z-50">
      <div className="flex justify-between items-center h-[72px] w-full max-w-[1280px] mx-auto px-8">
        <div className="flex items-center gap-6 h-full">
          <Link to="/" className="flex items-center gap-4">
            <img
              alt="AdmiSX Logo"
              className="h-8 w-8 object-contain rounded-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhAifkTCFt4mxv986qY6FxhCNWdsy9P7xE99MBx9qTbzBXjnaYPEqSlR5RJLMu6Tcy_PvucAfM6Bbjk96Wapf2v5LXfiFdvdLCFYZtkpFT9rCbkXpDt7z-0DmilKJ0k2VL_ueQrYJli-XALn-tjN0IC3bJFeOBPdK2UWvZ5egUn3nesAFatPkGRQiMv3F5MHj7CysleluG92vTeLvsUeYTZ6gkqq1c5qH2Pc0nbZJ6DsSQCoR2kuXDh-XJfLGYLzZUb7uJyMu-deE"
            />
            <span
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.4" }}
            >
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
                      ? "text-white border-[#14B8FF]"
                      : "text-white/80 hover:text-white border-transparent"
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
              <button className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all active:opacity-80 active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0EA5E9] flex items-center justify-center overflow-hidden border border-white/20">
                    <span className="text-white text-sm font-bold">
                      {user?.full_name?.charAt(0) ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </span>
                  </div>
                  <span className="text-white/80 text-sm font-medium hidden sm:block group-hover:text-white transition-colors">
                    {user?.full_name || user?.email || ""}
                  </span>
                  <span className="material-symbols-outlined text-white/60 text-[18px]">
                    arrow_drop_down
                  </span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E4E7EC] overflow-hidden z-50">
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#101828] hover:bg-[#F9FAFB] transition-colors"
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
                  (window.location.href = "http://localhost:5173/login")
                }
                className="text-white/80 text-sm hover:text-white transition-colors cursor-pointer"
              >
                Đăng nhập
              </button>
              <a
                href="http://localhost:5173/register"
                className="bg-[#0EA5E9] text-white font-semibold px-6 py-2 rounded-[10px] shadow-sm hover:bg-[#0095d4] transition-all cursor-pointer active:scale-95 text-sm"
              >
                Đăng ký
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
