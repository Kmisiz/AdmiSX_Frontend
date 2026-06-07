import { Link } from "@tanstack/react-router";
import {
  ArrowRightOutlined,
  BankOutlined,
  GlobalOutlined,
  LaptopOutlined,
} from "@ant-design/icons";
import { Button, Card, Tag } from "antd";
import { useAuthStore } from "../store/auth";

const ADMIS_URL = import.meta.env.VITE_ADMIS_URL || "http://localhost:7173";

const featuredPrograms = [
  {
    icon: <LaptopOutlined />,
    title: "Công nghệ thông tin",
    school: "Trường Đại học Công nghệ - ĐHQGHN",
    description:
      "Chương trình cử nhân CNTT định hướng phát triển phần mềm, dữ liệu, AI, an toàn thông tin và điện toán đám mây.",
    tags: ["CNTT", "AI", "Khoa học dữ liệu"],
    href: "https://www.uet.vnu.edu.vn/chuong-trinh-dao-tao-nganh-cong-nghe-thong-tin-11/",
  },
  {
    icon: <LaptopOutlined />,
    title: "Công nghệ thông tin",
    school: "Học viện Công nghệ Bưu chính Viễn thông",
    description:
      "Định hướng nền tảng lập trình, phát triển phần mềm, hệ thống thông tin và các công nghệ mới trong lĩnh vực ICT.",
    tags: ["PTIT", "CNTT", "ICT"],
    href: "https://tuyensinh.ptit.edu.vn/tuyen-sinh-ptit-tong-quan-ve-nganh-hoc-cong-nghe-thong-tin/",
  },
  {
    icon: <GlobalOutlined />,
    title: "Kinh doanh quốc tế",
    school: "Trường Đại học Kinh tế - Luật",
    description:
      "Đào tạo nền tảng kinh tế, quản lý, logistics, thương mại quốc tế và khả năng thích ứng trong môi trường toàn cầu.",
    tags: ["Kinh doanh", "Logistics", "Thương mại"],
    href: "https://tuyensinh.uel.edu.vn/gioi-thieu-nganh-kinh-doanh-quoc-te/",
  },
  {
    icon: <BankOutlined />,
    title: "Kinh tế quốc tế",
    school: "Trường Đại học Kinh tế - Luật",
    description:
      "Phù hợp với thí sinh quan tâm chính sách kinh tế, hội nhập, doanh nghiệp có quan hệ kinh tế quốc tế.",
    tags: ["Kinh tế", "Hội nhập", "Chính sách"],
    href: "https://tuyensinh.uel.edu.vn/gioi-thieu-nganh-kinh-te-quoc-te/",
  },
  {
    icon: <BankOutlined />,
    title: "Quản trị Kinh doanh Quốc tế",
    school: "Đại học Kinh tế Quốc dân",
    description:
      "Chương trình quốc tế IBD@NEU tập trung vào quản trị, kinh doanh quốc tế, marketing và môi trường học tập hội nhập.",
    tags: ["NEU", "Quản trị", "Quốc tế"],
    href: "https://ibd-isme.neu.edu.vn/",
  },
  {
    icon: <GlobalOutlined />,
    title: "Ngôn ngữ Anh",
    school: "Trường Đại học Hà Nội",
    description:
      "Đào tạo năng lực ngôn ngữ, biên phiên dịch, giao tiếp học thuật và kỹ năng làm việc trong môi trường đa văn hóa.",
    tags: ["HANU", "Ngôn ngữ", "Tiếng Anh"],
    href: "https://hanu.edu.vn/a/254574/Thong-tin-tuyen-sinh-dai-hoc-nam-2026-Hinh-thuc-dao-tao-Chinh-quy",
  },
];

const PublicDashboard = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-cover bg-center py-24"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(52, 58, 64, 0.92) 0%, rgba(52, 58, 64, 0.75) 50%, rgba(52, 58, 64, 0.5) 100%), url('/hero-campus.jpg')",
        }}
      >
        <div className="max-w-[1280px] mx-auto relative z-10 flex min-h-[520px] items-center px-4 sm:px-6 lg:px-9">
          <div className="max-w-3xl text-left">
            <h1 className="hero-title-animate text-white font-bold leading-tight mb-4 text-[40px] md:text-[48px]">
              Bắt đầu hành trình đại học của bạn tại AdmiSX
            </h1>
            <p className="hero-subtitle-animate text-[var(--color-slate)] mb-6 max-w-xl text-[15px] leading-relaxed">
              Nền tảng tuyển sinh hiện đại giúp bạn kết nối với những cơ hội học
              tập hàng đầu. Đơn giản, minh bạch và định hướng tương lai.
            </p>
            {!isAuthenticated && (
              <div className="hero-actions-animate flex gap-4">
                <a
                  href={`${ADMIS_URL}/register`}
                  className="btn-primary-on-dark text-[16px]"
                >
                  Đăng ký ngay
                </a>
                <a
                  href="#admissions-process"
                  className="btn-secondary border-white/80 text-white hover:bg-white/10 hover:text-white hover:border-white"
                >
                  Tìm hiểu thêm
                </a>
              </div>
            )}
            {isAuthenticated && (
              <div className="hero-actions-animate flex gap-4">
                <a
                  href="/dashboard"
                  className="btn-primary-on-dark text-[16px]"
                >
                  Vào Dashboard
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Admissions Process */}
      <section
        id="admissions-process"
        className="scroll-mt-24 py-12 px-4 sm:px-6 lg:px-9 max-w-[1280px] mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-[var(--color-ink-deep)] font-bold mb-2 text-[32px] leading-tight">
            Quy trình tuyển sinh
          </h2>
          <div className="h-1 w-20 bg-[var(--color-primary)] mx-auto rounded-full" />
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
              className="bg-white border border-[var(--color-hairline)] rounded p-6 flat-card relative z-10"
            >
              <div className="bg-[var(--color-primary-soft)] w-12 h-12 rounded flex items-center justify-center mb-4">
                <span
                  className="material-symbols-outlined text-[var(--color-primary)]"
                  style={{ fontSize: "28px" }}
                >
                  {step.icon}
                </span>
              </div>
              <h3 className="text-[var(--color-ink-deep)] font-bold mb-2 text-[20px] leading-tight">
                {step.title}
              </h3>
              <p className="text-[var(--color-charcoal)] text-[14px] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Programs + Benefits Grid */}
      <section
        id="featured-programs"
        className="scroll-mt-24 py-12 bg-[var(--color-canvas-soft)]"
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-9">
          {/* Featured Programs (2/3) */}
          <div className="lg:col-span-2">
            <h2 className="text-[var(--color-ink-deep)] font-bold mb-6 text-[32px] leading-tight">
              Chương trình nổi bật
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {featuredPrograms.map((program) => (
                <Card
                  key={`${program.school}-${program.title}`}
                  className="h-full border-[var(--color-hairline)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  styles={{ body: { height: "100%", padding: 24 } }}
                >
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[var(--color-primary-soft)] text-[22px] text-[var(--color-primary)]">
                        {program.icon}
                      </div>
                    </div>

                    <h3 className="text-[20px] font-bold leading-tight text-[var(--color-ink-deep)]">
                      {program.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">
                      {program.school}
                    </p>
                    <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[var(--color-charcoal)]">
                      {program.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {program.tags.map((tag) => (
                        <Tag key={tag} className="m-0 rounded">
                          {tag}
                        </Tag>
                      ))}
                    </div>

                    <Button
                      type="primary"
                      href={program.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex w-fit items-center rounded bg-[var(--color-primary)] font-semibold border-none shadow-[0_2px_4px_rgba(0,0,0,0.10)] hover:bg-[var(--color-primary-dark)]"
                      icon={<ArrowRightOutlined />}
                      iconPlacement="end"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose AdmiSX (1/3) */}
          <div className="lg:col-span-1">
            <h2 className="text-[var(--color-ink-deep)] font-bold mb-6 text-[32px] leading-tight">
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
                  className="bg-white border border-[var(--color-hairline)] rounded p-4 flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0 bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <span className="material-symbols-outlined">
                      {benefit.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[var(--color-ink-deep)] font-semibold text-[16px] leading-relaxed">
                      {benefit.title}
                    </p>
                    <p className="text-[var(--color-charcoal)] text-[13px] leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Card */}
            <div className="mt-8 bg-[var(--color-primary)] text-white p-8 rounded relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold mb-3 text-[20px] leading-tight">
                  Cần trợ giúp?
                </h4>
                <p className="mb-4 opacity-90 text-[14px] leading-relaxed">
                  Đội ngũ tư vấn luôn sẵn sàng giải đáp thắc mắc của bạn.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex bg-white text-[var(--color-primary)] px-6 py-3 rounded font-semibold hover:bg-[var(--color-canvas-soft)] transition-colors text-[14px]"
                >
                  Liên hệ ngay
                </Link>
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
