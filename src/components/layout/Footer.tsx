const Footer = () => {
  return (
    <footer className="mt-10 border-t border-[#E4E7EC]">
      <div className="flex flex-col md:flex-row justify-between items-center py-6 px-8 max-w-[1280px] mx-auto gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#344054]">AdmiSX</span>
          <span className="text-sm text-[#667085] ml-2">
            &copy; 2026 AdmiSX Admissions Portal. All rights reserved.
          </span>
        </div>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Help Center"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-[#667085] hover:text-[#032D60] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
