import { useState, useEffect, useCallback } from "react";
import Toast from "../components/common/Toast";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DocumentViewer from "../components/common/DocumentViewer";
import { admissionsApi, type DocumentData } from "../apis/admissions";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  TRANSCRIPT: "Bảng điểm",
  CITIZEN_ID_Front: "CMND/CCCD (Mặt trước)",
  CITIZEN_ID_Back: "CMND/CCCD (Mặt sau)",
  PORTRAIT: "Ảnh thẻ",
  CERTIFICATE: "Chứng chỉ khác",
  EXAM_CERTIFICATE: "Giấy chứng nhận kết quả thi",
  OTHER: "Khác",
};

const DOCUMENT_TYPE_ICONS: Record<string, string> = {
  TRANSCRIPT: "description",
  CITIZEN_ID_Front: "id_card",
  CITIZEN_ID_Back: "id_card",
  PORTRAIT: "badge",
  CERTIFICATE: "verified_user",
  EXAM_CERTIFICATE: "school",
  OTHER: "folder_open",
};

const UPLOAD_OPTIONS = [
  { value: "TRANSCRIPT", label: "Bảng điểm", icon: "description" },
  {
    value: "CITIZEN_ID_Front",
    label: "CMND/CCCD (Mặt trước)",
    icon: "id_card",
  },
  { value: "CITIZEN_ID_Back", label: "CMND/CCCD (Mặt sau)", icon: "id_card" },
  { value: "PORTRAIT", label: "Ảnh thẻ", icon: "badge" },
  {
    value: "EXAM_CERTIFICATE",
    label: "Giấy chứng nhận kết quả thi",
    icon: "school",
  },
  { value: "CERTIFICATE", label: "Chứng chỉ khác", icon: "verified_user" },
];

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [viewDoc, setViewDoc] = useState<DocumentData | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentData | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await admissionsApi.getDocuments();
      setDocuments(res.data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await admissionsApi.getDocuments();
        if (!ignore) setDocuments(res.data.data || []);
      } catch {
        // ignore
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpload = async (docType: string, file: File) => {
    setUploading(true);
    try {
      await admissionsApi.uploadDocument(file, docType);
      await fetchDocuments();
      setShowUploadModal(false);
      setMessage({ type: "success", text: "Tải lên tài liệu thành công!" });
    } catch {
      setMessage({
        type: "error",
        text: "Tải lên thất bại. Vui lòng thử lại.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await admissionsApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setMessage({ type: "success", text: "Đã xóa tài liệu." });
    } catch {
      setMessage({ type: "error", text: "Xóa thất bại. Vui lòng thử lại." });
    }
    setDeleteTarget(null);
  };

  const handleDownload = async (doc: DocumentData) => {
    try {
      const res = await fetch(doc.file_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(doc.file_url, "_blank");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredDocuments =
    activeFilter === "all"
      ? documents
      : documents.filter(() => {
          if (activeFilter === "verified") return true;
          if (activeFilter === "pending") return false;
          if (activeFilter === "incomplete") return false;
          return true;
        });

  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#101828] leading-tight">
              Hồ sơ tài liệu
            </h1>
            <p className="text-sm text-[#667085] mt-1 max-w-2xl">
              Quản lý các giấy tờ, bằng cấp phục vụ cho quá trình xét tuyển.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#032D60] hover:bg-[#021a40] text-white px-6 h-10 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tải lên tài liệu
          </button>
        </div>

        {/* Filters & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8 items-stretch">
          <div className="md:col-span-9 bg-white border border-[#E4E7EC] p-4 rounded-xl flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#667085] uppercase mr-1 ml-1">
              Lọc theo:
            </span>
            {[
              { key: "all", label: `Tất cả (${documents.length})` },
              { key: "verified", label: "Đã xác thực" },
              { key: "pending", label: "Đang xử lý" },
              { key: "incomplete", label: "Cần bổ sung" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === f.key
                    ? "bg-[#032D60] text-white shadow-sm"
                    : "bg-[#F4F6F9] text-[#667085] border border-[#D0D5DD] hover:border-[#032D60]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 bg-white border border-[#E4E7EC] p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#667085] uppercase tracking-widest mb-0.5">
                Tiến độ hồ sơ
              </p>
              <p className="text-2xl font-bold text-[#04844B] leading-none">
                {documents.length > 0
                  ? `${Math.min(Math.round((documents.length / 6) * 100), 100)}%`
                  : "0%"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#04844B]/10 border-2 border-[#04844B]/20 flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  className="text-[#04844B]"
                  cx="22"
                  cy="22"
                  fill="transparent"
                  r="18"
                  stroke="currentColor"
                  strokeDasharray="113"
                  strokeDashoffset={
                    113 -
                    (113 * Math.min((documents.length / 6) * 100, 100)) / 100
                  }
                  strokeWidth="3"
                />
              </svg>
              <span className="material-symbols-outlined text-[#04844B] text-[18px]">
                {documents.length >= 6 ? "verified" : "pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#032D60] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDocuments.length === 0 && activeFilter === "all" ? (
          /* Empty State */
          <div
            onClick={() => setShowUploadModal(true)}
            className="bg-[#F4F6F9] border-2 border-dashed border-[#D0D5DD] rounded-2xl flex flex-col items-center justify-center py-16 gap-4 hover:bg-white hover:border-[#032D60] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-[#D0D5DD] flex items-center justify-center text-[#667085] group-hover:bg-[#032D60]/10 group-hover:text-[#032D60] transition-colors">
              <span className="material-symbols-outlined text-[24px]">
                add_circle
              </span>
            </div>
            <div className="text-center">
              <p className="font-bold text-[#475467]">Chưa có tài liệu nào</p>
              <p className="text-xs text-[#667085] mt-1 px-4">
                Nhấn vào đây để tải lên tài liệu đầu tiên
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocuments.map((doc) => {
              const isImage =
                doc.file_type.startsWith("image/") ||
                /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.file_url);
              const isPdf =
                doc.file_type === "application/pdf" ||
                /\.pdf$/i.test(doc.file_url);

              return (
                <div
                  key={doc.id}
                  className="bg-white border border-[#E4E7EC] rounded-2xl overflow-hidden flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Card Header */}
                  <div className="p-5 flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F6F9] border border-[#E4E7EC] flex items-center justify-center text-[#032D60]">
                        <span className="material-symbols-outlined">
                          {DOCUMENT_TYPE_ICONS[doc.document_type] ||
                            "description"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#101828]">
                          {DOCUMENT_TYPE_LABELS[doc.document_type] ||
                            doc.document_type}
                        </h3>
                        <p className="text-[11px] text-[#667085] font-medium">
                          Cập nhật: {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#04844B]/10 text-[#04844B] rounded-full text-[9px] font-bold uppercase tracking-wider border border-[#04844B]/20">
                      Đã xác thực
                    </span>
                  </div>

                  {/* Preview Area */}
                  <div className="px-5 pb-3 flex-grow">
                    {isImage ? (
                      <div className="aspect-[16/9] bg-[#F4F6F9] border border-[#E4E7EC] rounded-xl overflow-hidden relative group">
                        <img
                          src={doc.file_url}
                          alt={doc.file_name}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-[#032D60]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => setViewDoc(doc)}
                            className="w-10 h-10 bg-white rounded-full shadow-md text-[#032D60] flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <span className="material-symbols-outlined">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="w-10 h-10 bg-white rounded-full shadow-md text-[#032D60] flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <span className="material-symbols-outlined">
                              download
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : isPdf ? (
                      <div className="aspect-[16/9] bg-[#F4F6F9] border border-[#E4E7EC] rounded-xl overflow-hidden relative group flex items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-[#98A2B3]">
                          picture_as_pdf
                        </span>
                        <div className="absolute inset-0 bg-[#032D60]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => setViewDoc(doc)}
                            className="w-10 h-10 bg-white rounded-full shadow-md text-[#032D60] flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <span className="material-symbols-outlined">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="w-10 h-10 bg-white rounded-full shadow-md text-[#032D60] flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <span className="material-symbols-outlined">
                              download
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-[#F4F6F9] border border-[#E4E7EC] rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-[#98A2B3]">
                          description
                        </span>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-[#667085] text-xs">
                      <span className="material-symbols-outlined text-[14px]">
                        attachment
                      </span>
                      <span>{doc.file_name}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => setViewDoc(doc)}
                      className="flex-1 h-9 bg-[#F4F6F9] hover:bg-[#E4E7EC] border border-[#D0D5DD] rounded-full text-xs font-bold text-[#475467] transition-colors"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => setDeleteTarget(doc)}
                      className="w-9 h-9 border border-[#D0D5DD] rounded-full text-[#667085] flex items-center justify-center hover:bg-[#FEF2F2] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty State Card (add new) */}
            <div
              onClick={() => setShowUploadModal(true)}
              className="bg-[#F4F6F9] border-2 border-dashed border-[#D0D5DD] rounded-2xl flex flex-col items-center justify-center p-8 gap-4 hover:bg-white hover:border-[#032D60] transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#D0D5DD] flex items-center justify-center text-[#667085] group-hover:bg-[#032D60]/10 group-hover:text-[#032D60] transition-colors">
                <span className="material-symbols-outlined text-[24px]">
                  add_circle
                </span>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#475467]">Thêm chứng chỉ khác</p>
                <p className="text-xs text-[#667085] mt-1 px-4">
                  Bằng khen, giải thưởng hoặc các chứng chỉ ngoại khóa khác
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <section className="mt-8 bg-[#032D60] text-white p-8 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0 border border-white/20">
              <span className="material-symbols-outlined text-[36px]">
                help
              </span>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold mb-2">Hỗ trợ hồ sơ tài liệu</h2>
              <p className="text-sm text-white/80 mb-4 max-w-xl leading-relaxed">
                Định dạng chấp nhận: PDF, JPG, PNG (tối đa 10MB/file). Đảm bảo
                tài liệu được quét hoặc chụp đủ ánh sáng, rõ nội dung và đủ 4
                góc.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  href="#"
                  className="px-6 py-2.5 bg-white text-[#032D60] font-bold text-xs rounded-full shadow-md hover:bg-[#F4F6F9] transition-colors"
                >
                  Xem hướng dẫn chi tiết
                </a>
                <a
                  href="#"
                  className="px-6 py-2.5 border border-white/30 text-white font-bold text-xs rounded-full hover:bg-white/10 transition-colors"
                >
                  Gửi yêu cầu hỗ trợ
                </a>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        </section>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}

      {/* Document Viewer */}
      {viewDoc && (
        <DocumentViewer
          fileUrl={viewDoc.file_url}
          fileType={viewDoc.file_type}
          fileName={viewDoc.file_name}
          onClose={() => setViewDoc(null)}
        />
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Xóa "${deleteTarget.file_name}"?`}
          confirmLabel="Xóa"
          danger
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {message && (
        <Toast message={message} onDismiss={() => setMessage(null)} />
      )}
    </div>
  );
};

function UploadModal({
  onClose,
  onUpload,
  uploading,
}: {
  onClose: () => void;
  onUpload: (docType: string, file: File) => void;
  uploading: boolean;
}) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!selectedType || !selectedFile) return;
    onUpload(selectedType, selectedFile);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#101828]">Tải lên tài liệu</h2>
          <button
            onClick={onClose}
            className="text-[#667085] hover:text-[#101828] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#344054]">
              Loại tài liệu <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm"
            >
              <option value="">Chọn loại tài liệu</option>
              {UPLOAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#344054]">
              Chọn file <span className="text-[#EF4444]">*</span>
            </label>
            <label className="flex items-center justify-center gap-2 h-11 px-3 border border-dashed border-[#D0D5DD] rounded-lg cursor-pointer hover:border-[#032D60] transition-colors">
              <span className="material-symbols-outlined text-[18px] text-[#667085]">
                cloud_upload
              </span>
              <span className="text-sm text-[#667085]">
                {selectedFile ? selectedFile.name : "Chọn file (PDF, JPG, PNG)"}
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#475467] border border-[#D0D5DD] rounded-full hover:bg-[#F4F6F9] transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || !selectedFile || uploading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#032D60] rounded-full hover:bg-[#021a40] transition-colors disabled:opacity-50"
          >
            {uploading ? "Đang tải..." : "Tải lên"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
