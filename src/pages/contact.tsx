import { useState } from "react";

const CONTACT_CHANNELS = [
  {
    icon: "call",
    title: "Hotline tuyển sinh",
    value: "1900 636 456",
    description: "Hỗ trợ nhanh các câu hỏi về hồ sơ, lệ phí và lịch xét tuyển.",
    href: "tel:1900636456",
  },
  {
    icon: "mail",
    title: "Email tư vấn",
    value: "tuyensinh@admisx.edu.vn",
    description:
      "Gửi câu hỏi chi tiết, đội ngũ tư vấn sẽ phản hồi trong ngày làm việc.",
    href: "mailto:tuyensinh@admisx.edu.vn",
  },
  {
    icon: "location_on",
    title: "Văn phòng hỗ trợ",
    value: "Tầng 5, Trung tâm Tuyển sinh AdmiSX",
    description:
      "Tiếp nhận hồ sơ trực tiếp và tư vấn thủ tục đăng ký xét tuyển.",
    href: "https://maps.google.com",
  },
];

const SUPPORT_TOPICS = [
  "Tư vấn chọn ngành",
  "Hướng dẫn đăng ký tài khoản",
  "Kiểm tra hồ sơ xét tuyển",
  "Tra cứu trạng thái đăng ký",
];

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-[#F5F7FB]">
      <section className="hero-gradient px-6 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">
                support_agent
              </span>
              Liên hệ nhanh
            </div>
            <h1 className="max-w-3xl text-[36px] font-bold leading-tight md:text-[48px]">
              Đội ngũ tuyển sinh luôn sẵn sàng hỗ trợ cậu
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[#B7E4FF]">
              Gửi câu hỏi hoặc chọn kênh liên hệ phù hợp để được hướng dẫn về
              đăng ký, hồ sơ xét tuyển và trạng thái nguyện vọng.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#032D60]">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#84CFFF]">
                  Thời gian hỗ trợ
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  08:00 - 17:30, Thứ 2 đến Thứ 7
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Các yêu cầu ngoài giờ sẽ được ghi nhận và phản hồi vào ca làm
                  việc tiếp theo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {CONTACT_CHANNELS.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              className="flex gap-4 rounded-3xl border border-[#E4E7EC] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#032D60]/30 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#032D60]/10 text-[#032D60]">
                <span className="material-symbols-outlined">
                  {channel.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#667085]">
                  {channel.title}
                </p>
                <h3 className="mt-1 text-[18px] font-bold leading-tight text-[#344054]">
                  {channel.value}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#667085]">
                  {channel.description}
                </p>
              </div>
            </a>
          ))}

          <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6">
            <h2 className="text-xl font-bold text-[#344054]">
              Chủ đề hỗ trợ thường gặp
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SUPPORT_TOPICS.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center gap-3 rounded-2xl bg-[#F4F6F9] px-4 py-3 text-sm font-semibold text-[#344054]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#04844B]">
                    check_circle
                  </span>
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#032D60]">
              Gửi yêu cầu tư vấn
            </p>
            <h2 className="mt-2 text-[28px] font-bold leading-tight text-[#344054]">
              Để lại thông tin, AdmiSX sẽ liên hệ lại
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#667085]">
              Form này ghi nhận nhu cầu liên hệ nhanh trên giao diện. Khi có API
              hỗ trợ, phần gửi yêu cầu có thể nối trực tiếp vào backend.
            </p>
          </div>

          {submitted && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#B7E4D0] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48]">
              <span className="material-symbols-outlined text-[20px]">
                task_alt
              </span>
              Thông tin đã được ghi nhận trên trang. Cậu có thể gọi hotline nếu
              cần phản hồi ngay.
            </div>
          )}

          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
              event.currentTarget.reset();
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#344054]">
                Họ và tên
                <input
                  required
                  name="name"
                  placeholder="Nguyễn Văn A"
                  className="h-12 rounded-2xl border border-[#D0D5DD] px-4 text-sm font-normal text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#032D60]"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#344054]">
                Số điện thoại
                <input
                  required
                  name="phone"
                  inputMode="tel"
                  placeholder="0901 234 567"
                  className="h-12 rounded-2xl border border-[#D0D5DD] px-4 text-sm font-normal text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#032D60]"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#344054]">
              Email
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                className="h-12 rounded-2xl border border-[#D0D5DD] px-4 text-sm font-normal text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#032D60]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#344054]">
              Nội dung cần hỗ trợ
              <textarea
                required
                name="message"
                rows={5}
                placeholder="Cậu cần tư vấn về hồ sơ, ngành học hoặc trạng thái đăng ký?"
                className="resize-none rounded-2xl border border-[#D0D5DD] px-4 py-3 text-sm font-normal leading-relaxed text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#032D60]"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#032D60] px-6 text-sm font-bold text-white transition-all hover:bg-[#021A40] active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">
                send
              </span>
              Gửi yêu cầu
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
