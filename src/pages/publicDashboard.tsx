import { useAuthStore } from "../store/auth";

const ADMIS_URL = import.meta.env.VITE_ADMIS_URL || "http://localhost:7173";

const SPACING = {
  margin: "24px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xs: "4px",
  sm: "8px",
  gutter: "16px",
};

const PublicDashboard = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative py-24 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #032D60 0%, #00658e 100%)",
          paddingLeft: SPACING.margin,
          paddingRight: SPACING.margin,
        }}
      >
        <div
          className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center"
          style={{ gap: SPACING.xl }}
        >
          <div className="md:w-3/5 text-left">
            <h1
              className="text-white font-bold leading-tight mb-md"
              style={{
                fontSize: "40px",
                lineHeight: "1.2",
                fontFamily: "'Nunito Sans', sans-serif",
                marginBottom: SPACING.md,
              }}
            >
              Bắt đầu hành trình đại học của bạn tại AdmiSX
            </h1>
            <p
              className="text-[#84cfff] mb-lg max-w-xl"
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                fontFamily: "'Nunito Sans', sans-serif",
                marginBottom: SPACING.lg,
              }}
            >
              Nền tảng tuyển sinh hiện đại giúp bạn kết nối với những cơ hội học
              tập hàng đầu. Đơn giản, minh bạch và định hướng tương lai.
            </p>
            <div style={{ display: "flex", gap: SPACING.md }}>
              <a
                href={
                  isAuthenticated ? "/register/step-1" : `${ADMIS_URL}/register`
                }
                className="bg-white text-[#032D60] font-semibold px-xl py-md rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                style={{
                  fontSize: "16px",
                  lineHeight: "1.5",
                  fontFamily: "'Nunito Sans', sans-serif",
                  padding: "16px 32px",
                  borderRadius: "0.5rem",
                }}
              >
                Đăng ký ngay
              </a>
              <button
                className="border border-white text-white font-semibold px-xl py-md rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                style={{
                  fontSize: "16px",
                  lineHeight: "1.5",
                  fontFamily: "'Nunito Sans', sans-serif",
                  padding: "16px 32px",
                  borderRadius: "0.5rem",
                }}
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          <div className="md:w-2/5 hidden md:block">
            <div
              className="relative bg-white/10 backdrop-blur-md p-lg rounded-full border border-white/20 aspect-square flex items-center justify-center animate-pulse"
              style={{ padding: SPACING.lg }}
            >
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
      <section
        className="py-xl px-margin max-w-7xl mx-auto"
        style={{ padding: `${SPACING.xl} ${SPACING.margin}` }}
      >
        <div className="text-center mb-xl" style={{ marginBottom: SPACING.xl }}>
          <h2
            className="text-text-primary font-bold mb-xs"
            style={{
              fontSize: "32px",
              lineHeight: "1.25",
              fontFamily: "'Nunito Sans', sans-serif",
              marginBottom: SPACING.xs,
            }}
          >
            Quy trình tuyển sinh
          </h2>
          <div className="h-1 w-20 bg-[#00a1e0] mx-auto rounded-full" />
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-4 relative"
          style={{ gap: SPACING.gutter }}
        >
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
              className="bg-white p-lg rounded-xl border border-border-silver bento-card relative z-10"
              style={{ padding: SPACING.lg }}
            >
              <div
                className="bg-[#00a1e0]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-md"
                style={{ marginBottom: SPACING.md }}
              >
                <span
                  className="material-symbols-outlined text-[#00a1e0]"
                  style={{ fontSize: "28px" }}
                >
                  {step.icon}
                </span>
              </div>
              <h3
                className="text-text-primary font-bold mb-sm"
                style={{
                  fontSize: "20px",
                  lineHeight: "1.4",
                  fontFamily: "'Nunito Sans', sans-serif",
                  marginBottom: SPACING.sm,
                }}
              >
                {step.title}
              </h3>
              <p
                className="text-[#706E6B]"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.5",
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Programs + Benefits Grid */}
      <section
        className="py-xl"
        style={{ padding: `${SPACING.xl} 0`, backgroundColor: "#F4F6F9" }}
      >
        <div
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3"
          style={{
            gap: SPACING.xl,
            paddingLeft: SPACING.margin,
            paddingRight: SPACING.margin,
          }}
        >
          {/* Featured Programs (2/3) */}
          <div className="lg:col-span-2">
            <h2
              className="text-text-primary font-bold"
              style={{
                fontSize: "32px",
                lineHeight: "1.25",
                fontFamily: "'Nunito Sans', sans-serif",
                marginBottom: SPACING.lg,
              }}
            >
              Chương trình nổi bật
            </h2>
            <div
              className="bg-white rounded-xl border border-border-silver p-lg text-center"
              style={{ padding: SPACING.lg }}
            >
              <p
                className="text-[#706E6B]"
                style={{
                  fontSize: "16px",
                  lineHeight: "1.5",
                  fontFamily: "'Nunito Sans', sans-serif",
                }}
              >
                Các chương trình nổi bật sẽ sớm được cập nhật
              </p>
            </div>
          </div>

          {/* Why Choose AdmiSX (1/3) */}
          <div className="lg:col-span-1">
            <h2
              className="text-text-primary font-bold mb-lg"
              style={{
                fontSize: "32px",
                lineHeight: "1.25",
                fontFamily: "'Nunito Sans', sans-serif",
                marginBottom: SPACING.lg,
              }}
            >
              Tại sao chọn AdmiSX?
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: SPACING.md,
              }}
            >
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
                  className="bg-white p-md rounded-xl shadow-sm flex gap-md items-start"
                  style={{
                    padding: SPACING.md,
                    borderLeft: "4px solid #00658e",
                    gap: SPACING.md,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "rgba(0, 101, 142, 0.1)",
                      color: "#00658e",
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {benefit.icon}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-text-primary font-semibold"
                      style={{
                        fontSize: "16px",
                        lineHeight: "1.5",
                        fontFamily: "'Nunito Sans', sans-serif",
                      }}
                    >
                      {benefit.title}
                    </p>
                    <p
                      className="text-[#706E6B]"
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.5",
                        fontFamily: "'Nunito Sans', sans-serif",
                      }}
                    >
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Card */}
            <div
              className="mt-xl bg-[#00658e] text-white p-lg rounded-xl relative overflow-hidden"
              style={{ marginTop: SPACING.xl, padding: SPACING.lg }}
            >
              <div className="relative z-10">
                <h4
                  className="font-bold mb-sm"
                  style={{
                    fontSize: "20px",
                    lineHeight: "1.4",
                    fontFamily: "'Nunito Sans', sans-serif",
                    marginBottom: SPACING.sm,
                  }}
                >
                  Cần trợ giúp?
                </h4>
                <p
                  className="mb-md opacity-90"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    fontFamily: "'Nunito Sans', sans-serif",
                    marginBottom: SPACING.md,
                  }}
                >
                  Đội ngũ tư vấn luôn sẵn sàng giải đáp thắc mắc của bạn.
                </p>
                <button
                  className="bg-white text-[#00658e] px-lg py-xs rounded-lg font-semibold hover:bg-[#f6faff] transition-colors"
                  style={{
                    padding: "4px 24px",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    fontFamily: "'Nunito Sans', sans-serif",
                    borderRadius: "0.25rem",
                  }}
                >
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
