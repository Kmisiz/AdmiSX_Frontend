const Footer = () => {
  return (
    <footer className="mt-10 border-t border-[var(--color-hairline)]">
      <div className="flex flex-col md:flex-row justify-between items-center py-6 px-8 max-w-[1280px] mx-auto gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[var(--color-ink-deep)]">
            AdmiSX
          </span>
          <span className="text-sm text-[var(--color-charcoal)] ml-2">
            &copy; 2026 Cổng tuyển sinh AdmiSX. Bảo lưu mọi quyền.
          </span>
        </div>
        <div className="flex gap-6">
          {["Chính sách bảo mật", "Điều khoản sử dụng", "Trung tâm hỗ trợ"].map(
            (item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-[var(--color-charcoal)] hover:text-[var(--color-primary)] transition-colors"
              >
                {item}
              </a>
            ),
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
