import { useAuthStore } from "../store/auth";

const ADMIS_URL = import.meta.env.VITE_ADMIS_URL || "http://localhost:7173";

const PublicDashboard = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8 px-6">
          <div className="md:w-3/5 text-left">
            <h1 className="text-white font-bold leading-tight mb-4 text-[40px] md:text-[48px]">
              Bắt đầu hành trình đại học của bạn tại AdmiSX
            </h1>
            <p className="text-[#84cfff] mb-6 max-w-xl text-[15px] leading-relaxed">
              Nền tảng tuyển sinh hiện đại giúp bạn kết nối với những cơ hội học
              tập hàng đầu. Đơn giản, minh bạch và định hướng tương lai.
            </p>
            <div className="flex gap-4">
              <a
                href={
                  isAuthenticated ? "/register/step-1" : `${ADMIS_URL}/register`
                }
                className="bg-white text-[#032D60] font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 text-[16px]"
              >
                Đăng ký ngay
              </a>
              <button className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all cursor-pointer text-[16px]">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          <div className="md:w-2/5 hidden md:block">
            <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/20 aspect-square flex items-center justify-center animate-pulse">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: "120px" }}
              >
                school
              </span>
            </div>
          </div>
        </div>
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-[#00a1e0] opacity-20 blur-[100px] rounded-full"
          style={{ transform: "translate(50%, -50%)" }}
        />
      </section>

      {/* Admissions Process */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[#101828] font-bold mb-2 text-[32px] leading-tight">
            Quy trình tuyển sinh
          </h2>
          <div className="h-1 w-20 bg-[#032D60] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            {
              icon: "person_add",
              title: "1. Đăng ký",
              desc: "Tạo tài khoản và cập nhật thông tin cá nhân cơ bản để bắt đầu.",
            },
            {
              icon: "list_alt",
              title: "2. Chọn ngành",
              desc: "Khám phá danh mục các chương trình đào tạo và chọn nguyện vọng.",
            },
            {
              icon: "upload_file",
              title: "3. Nộp hồ sơ",
              desc: "Tải lên các chứng chỉ và giấy tờ cần thiết theo yêu cầu của ngành.",
            },
            {
              icon: "check_circle",
              title: "4. Kết quả",
              desc: "Theo dõi trạng thái và nhận thông báo kết quả xét tuyển trực tuyến.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white p-6 rounded-3xl border border-[#E4E7EC] bento-card relative z-10"
            >
              <div className="bg-[#032D60]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span
                  className="material-symbols-outlined text-[#032D60]"
                  style={{ fontSize: "28px" }}
                >
                  {step.icon}
                </span>
              </div>
              <h3 className="text-[#101828] font-bold mb-2 text-[20px] leading-tight">
                {step.title}
              </h3>
              <p className="text-[#667085] text-[14px] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Programs + Benefits Grid */}
      <section className="py-12 bg-[#F4F6F9]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
          {/* Featured Programs (2/3) */}
          <div className="lg:col-span-2">
            <h2 className="text-[#101828] font-bold mb-6 text-[32px] leading-tight">
              Chương trình nổi bật
            </h2>
            <div className="bg-white rounded-3xl border border-[#E4E7EC] p-8 text-center">
              <p className="text-[#667085] text-[16px] leading-relaxed">
                Các chương trình nổi bật sẽ sớm được cập nhật
              </p>
            </div>
          </div>

          {/* Why Choose AdmiSX (1/3) */}
          <div className="lg:col-span-1">
            <h2 className="text-[#101828] font-bold mb-6 text-[32px] leading-tight">
              Tại sao chọn AdmiSX?
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: "account_balance",
                  title: "Đa dạng lựa chọn",
                  desc: "Kết nối với hàng chục trường đại học và các chương trình đào tạo trên khắp cả nước.",
                },
                {
                  icon: "folder_shared",
                  title: "Hồ sơ tập trung",
                  desc: "Nộp hồ sơ vào nhiều trường chỉ với một tài khoản duy nhất, tối ưu hóa thời gian và công sức.",
                },
                {
                  icon: "track_changes",
                  title: "Theo dõi thời gian thực",
                  desc: "Quản lý và theo dõi trạng thái hồ sơ của bạn tại tất cả các trường một cách bảo mật và chính xác.",
                },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white p-4 rounded-xl flex gap-4 items-start border-l-4 border-[#032D60]"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#032D60]/10 text-[#032D60]">
                    <span className="material-symbols-outlined">
                      {benefit.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#101828] font-semibold text-[16px] leading-relaxed">
                      {benefit.title}
                    </p>
                    <p className="text-[#667085] text-[13px] leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Card */}
            <div className="mt-8 bg-[#032D60] text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold mb-3 text-[20px] leading-tight">
                  Cần trợ giúp?
                </h4>
                <p className="mb-4 opacity-90 text-[14px] leading-relaxed">
                  Đội ngũ tư vấn luôn sẵn sàng giải đáp thắc mắc của bạn.
                </p>
                <button className="bg-white text-[#032D60] px-6 py-3 rounded-full font-semibold hover:bg-[#f4f6f9] transition-colors text-[14px]">
                  Liên hệ ngay
                </button>
              </div>
              <span
                className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10"
                style={{ fontSize: "100px" }}
              >
                contact_support
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PublicDashboard;
