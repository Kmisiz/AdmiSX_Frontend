import { Link } from "@tanstack/react-router";

const uploadSteps = [
  {
    title: "Chuẩn bị file",
    description:
      "Quét hoặc chụp tài liệu rõ nét, đủ ánh sáng, đủ bốn góc và không bị che thông tin quan trọng.",
    icon: "document_scanner",
  },
  {
    title: "Chọn đúng loại tài liệu",
    description:
      "Phân loại đúng CCCD, ảnh chân dung, bảng điểm, giấy chứng nhận kết quả thi hoặc chứng chỉ khác.",
    icon: "category",
  },
  {
    title: "Tải lên hồ sơ",
    description:
      "Chọn file PDF, JPG hoặc PNG, kiểm tra lại tên file rồi bấm tải lên trong trang Hồ sơ tài liệu.",
    icon: "cloud_upload",
  },
  {
    title: "Theo dõi trạng thái",
    description:
      "Kiểm tra trạng thái đã tải lên, eKYC hoặc thông báo bổ sung để xử lý kịp thời trước hạn nộp.",
    icon: "fact_check",
  },
];

const requiredDocuments = [
  {
    title: "CCCD mặt trước",
    note: "Ảnh phải thấy rõ số CCCD, họ tên, ngày sinh và ảnh chân dung trên giấy tờ.",
    icon: "id_card",
  },
  {
    title: "CCCD mặt sau",
    note: "Không cắt mất mã QR, ngày cấp, nơi cấp và vùng thông tin ở mặt sau.",
    icon: "id_card",
  },
  {
    title: "Ảnh chân dung",
    note: "Chụp chính diện, nền sáng, không đội mũ, không dùng ảnh quá mờ hoặc bị ngược sáng.",
    icon: "badge",
  },
  {
    title: "Bảng điểm",
    note: "Tải bản scan hoặc ảnh rõ toàn bộ trang có thông tin điểm và dấu xác nhận nếu có.",
    icon: "description",
  },
  {
    title: "Giấy chứng nhận kết quả thi",
    note: "Dùng bản có đầy đủ môn thi, điểm thi và thông tin định danh của thí sinh.",
    icon: "school",
  },
  {
    title: "Chứng chỉ khác",
    note: "Chọn đúng tên chứng chỉ khi upload để hội đồng xét tuyển dễ đối chiếu.",
    icon: "verified_user",
  },
];

const documentExamples = [
  {
    title: "CCCD mặt trước",
    image: "/Cert/CCCD(mặt trước).jpg",
    checklist: "Rõ số CCCD, họ tên, ngày sinh và ảnh chân dung.",
  },
  {
    title: "CCCD mặt sau",
    image: "/Cert/CCCD(mặt sau).jpg",
    checklist: "Rõ mã QR, ngày cấp, nơi cấp và vùng thông tin mặt sau.",
  },
  {
    title: "Ảnh chân dung",
    image: "/Cert/anh_chan_dung.jpg",
    checklist:
      "Chụp chính diện, rõ khuôn mặt, nền sáng và không bị ngược sáng.",
  },
  {
    title: "Bảng điểm",
    image: "/Cert/Bg_diem.jpg",
    checklist:
      "Ảnh cần rõ họ tên, lớp/trường, các cột điểm và dấu xác nhận nếu có.",
  },
  {
    title: "Giấy chứng nhận kết quả thi THPT",
    image: "/Cert/giay_chung_nhan_ket_qua_thi_thpt.jpg",
    checklist:
      "Đủ thông tin thí sinh, môn thi, điểm thi và mã xác nhận nếu có.",
  },
];

const certificateGuides = [
  {
    name: "IELTS",
    image: "/Cert/IELTS.jpg",
    note: "Kiểm tra họ tên, ngày thi, overall band score và mã số chứng chỉ.",
  },
  {
    name: "TOEIC",
    image: "/Cert/TOEIC.jpg",
    note: "Ưu tiên bản thể hiện rõ điểm từng kỹ năng và ngày cấp chứng chỉ.",
  },
  {
    name: "JLPT",
    image: "/Cert/JLPT.jpg",
    note: "Chọn ảnh rõ cấp độ N1-N5, số báo danh và kết quả đạt/chưa đạt.",
  },
  {
    name: "HSK",
    image: "/Cert/HSK.png",
    note: "Cần thấy rõ cấp độ HSK, tổng điểm và thông tin định danh thí sinh.",
  },
  {
    name: "TOPIK",
    image: "/Cert/Topik.jpg",
    note: "Kiểm tra cấp độ, điểm thành phần và ngày hiệu lực trên chứng chỉ.",
  },
  {
    name: "DALF",
    image: "/Cert/DALF.jpg",
    note: "Đảm bảo thấy rõ cấp độ, số hiệu chứng chỉ và cơ quan cấp.",
  },
  {
    name: "TELC",
    image: "/Cert/TELC.jpg",
    note: "Upload bản có đủ điểm, cấp độ và thông tin xác thực của kỳ thi.",
  },
];

const fileStandards = [
  "Định dạng hỗ trợ: PDF, JPG, PNG.",
  "Mỗi file nên dưới 10MB để quá trình tải lên ổn định.",
  "Nội dung phải rõ chữ, không lóa sáng, không nhòe và không bị xoay ngang.",
  "Ảnh chụp cần đủ bốn góc tài liệu, không che mã QR, số hiệu hoặc dấu xác nhận.",
];

const commonIssues = [
  {
    issue: "File quá mờ hoặc thiếu góc",
    fix: "Chụp lại trên mặt phẳng, dùng ánh sáng đều và canh toàn bộ tài liệu trong khung hình.",
  },
  {
    issue: "Chọn sai loại tài liệu",
    fix: "Xóa file đã tải nhầm, sau đó upload lại với đúng nhóm tài liệu tương ứng.",
  },
  {
    issue: "eKYC chưa xác thực",
    fix: "Kiểm tra đủ CCCD mặt trước, mặt sau và ảnh chân dung; sau đó theo dõi trạng thái cập nhật.",
  },
  {
    issue: "Chứng chỉ không hiển thị đúng tên",
    fix: "Khi chọn loại Chứng chỉ khác, hãy chọn đúng tên chứng chỉ trong danh sách trước khi tải lên.",
  },
];

const UploadGuidePage = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-[var(--color-hairline)] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded border border-[var(--color-primary-ring)] bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-[16px]">
                help
              </span>
              Hướng dẫn hồ sơ
            </span>
            <h1 className="mt-3 text-[28px] font-bold leading-tight text-[var(--color-ink-deep)] sm:text-[34px]">
              Hướng dẫn upload chứng chỉ và tài liệu
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-charcoal)]">
              Chuẩn bị đúng file ngay từ đầu giúp hồ sơ xét tuyển được kiểm tra
              nhanh hơn và hạn chế yêu cầu bổ sung.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard/documents"
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[var(--color-primary)] px-5 text-sm font-bold text-white transition-all hover:bg-[var(--color-primary-dark)] active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                cloud_upload
              </span>
              Tải lên tài liệu
            </Link>
            <Link
              to="/dashboard/admissions"
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-[var(--color-hairline)] bg-white px-5 text-sm font-bold text-[var(--color-ink)] transition-all hover:bg-[var(--color-canvas-soft)] active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                assignment
              </span>
              Tiếp tục hồ sơ
            </Link>
          </div>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {uploadSteps.map((step, index) => (
            <div
              key={step.title}
              className="bg-white border border-[var(--color-hairline)] rounded p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <span className="material-symbols-outlined text-[24px]">
                    {step.icon}
                  </span>
                </div>
                <span className="text-xs font-bold text-[var(--color-charcoal)]">
                  Bước {index + 1}
                </span>
              </div>
              <h2 className="text-base font-bold text-[var(--color-ink-deep)]">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-charcoal)]">
                {step.description}
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="bg-white border border-[var(--color-hairline)] rounded overflow-hidden">
            <div className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-ink-deep)]">
                Nhóm tài liệu cần chuẩn bị
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              {requiredDocuments.map((doc) => (
                <div
                  key={doc.title}
                  className="flex gap-3 rounded border border-[var(--color-hairline)] bg-white p-4"
                >
                  <span className="material-symbols-outlined mt-0.5 text-[22px] text-[var(--color-primary)]">
                    {doc.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-ink-deep)]">
                      {doc.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-charcoal)]">
                      {doc.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[var(--color-hairline)] rounded overflow-hidden">
            <div className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-ink-deep)]">
                Tiêu chuẩn file
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-5 rounded bg-[var(--color-primary-soft)] p-4 text-[var(--color-primary)]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]">
                    rule
                  </span>
                  <span className="text-sm font-bold">
                    PDF, JPG, PNG - tối đa 10MB/file
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {fileStandards.map((standard) => (
                  <div key={standard} className="flex gap-2 text-sm">
                    <span className="material-symbols-outlined mt-0.5 text-[17px] text-[var(--color-success)]">
                      check_circle
                    </span>
                    <span className="leading-6 text-[var(--color-charcoal)]">
                      {standard}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1fr]">
          <section className="bg-white border border-[var(--color-hairline)] rounded overflow-hidden">
            <div className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-ink-deep)]">
                Chứng chỉ được hỗ trợ
              </h2>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm leading-6 text-[var(--color-charcoal)]">
                Với nhóm Chứng chỉ khác, hãy chọn đúng tên chứng chỉ trước khi
                upload để hồ sơ hiển thị rõ ràng khi xét tuyển.
              </p>
              <div className="flex flex-wrap gap-2">
                {certificateGuides.map((certificate) => (
                  <span
                    key={certificate.name}
                    className="rounded border border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-3 py-1.5 text-xs font-bold text-[var(--color-ink)]"
                  >
                    {certificate.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white border border-[var(--color-hairline)] rounded overflow-hidden">
            <div className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--color-ink-deep)]">
                Lỗi thường gặp và cách xử lý
              </h2>
            </div>
            <div className="divide-y divide-[var(--color-hairline)]">
              {commonIssues.map((item) => (
                <div
                  key={item.issue}
                  className="grid grid-cols-1 gap-2 px-6 py-4 md:grid-cols-[0.8fr_1.2fr]"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink-deep)]">
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-warning)]">
                      error
                    </span>
                    {item.issue}
                  </div>
                  <p className="text-sm leading-6 text-[var(--color-charcoal)]">
                    {item.fix}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 bg-white border border-[var(--color-hairline)] rounded overflow-hidden">
          <div className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-6 py-4">
            <h2 className="text-lg font-bold text-[var(--color-ink-deep)]">
              Mẫu minh họa từ tài liệu tham khảo
            </h2>
            <p className="mt-1 text-sm text-[var(--color-charcoal)]">
              Dùng các mẫu này để đối chiếu bố cục thông tin cần rõ trước khi
              tải file lên hệ thống.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {documentExamples.map((example) => (
              <div
                key={example.title}
                className="overflow-hidden rounded border border-[var(--color-hairline)] bg-white"
              >
                <div className="aspect-[16/10] bg-[var(--color-canvas-soft)]">
                  <img
                    src={example.image}
                    alt={`Mẫu ${example.title}`}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="border-t border-[var(--color-hairline)] p-4">
                  <h3 className="text-sm font-bold text-[var(--color-ink-deep)]">
                    {example.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-charcoal)]">
                    {example.checklist}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--color-hairline)] px-6 py-4">
            <h3 className="text-sm font-bold text-[var(--color-ink-deep)]">
              Mẫu chứng chỉ ngoại ngữ
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {certificateGuides.map((certificate) => (
                <div
                  key={certificate.name}
                  className="overflow-hidden rounded border border-[var(--color-hairline)] bg-white"
                >
                  <div className="aspect-[4/3] bg-[var(--color-canvas-soft)]">
                    <img
                      src={certificate.image}
                      alt={`Mẫu chứng chỉ ${certificate.name}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="border-t border-[var(--color-hairline)] p-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-[var(--color-primary)]">
                        verified_user
                      </span>
                      <h4 className="text-sm font-bold text-[var(--color-ink-deep)]">
                        {certificate.name}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-charcoal)]">
                      {certificate.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded border border-[var(--color-primary-ring)] bg-[var(--color-primary)] p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Sẵn sàng hoàn thiện hồ sơ?</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/80">
                Sau khi chuẩn bị đủ file, cậu có thể tải tài liệu lên và tiếp
                tục kiểm tra các bước xét tuyển còn lại.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard/documents"
                className="inline-flex h-10 items-center justify-center gap-2 rounded bg-white px-5 text-sm font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-canvas-soft)]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  upload_file
                </span>
                Mở trang tài liệu
              </Link>
              <Link
                to="/dashboard/admissions"
                className="inline-flex h-10 items-center justify-center gap-2 rounded border border-white/30 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
                Tiếp tục xét tuyển
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UploadGuidePage;
