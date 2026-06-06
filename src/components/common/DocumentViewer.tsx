import { useEffect } from "react";

interface DocumentViewerProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  onClose: () => void;
}

export default function DocumentViewer({
  fileUrl,
  fileType,
  fileName,
  onClose,
}: DocumentViewerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isImage =
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
  const isPdf = fileType === "application/pdf" || /\.pdf$/i.test(fileUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E4E7EC]">
          <h3 className="text-sm font-semibold text-[#101828] truncate max-w-[80%]">
            {fileName}
          </h3>
          <button
            onClick={onClose}
            className="text-[#667085] hover:text-[#101828] p-1 flex-shrink-0 rounded-full hover:bg-[#F4F6F9] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-[#F9FAFB] flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-[70vh]"
            />
          ) : (
            <div className="text-center p-8">
              <span className="material-symbols-outlined text-[48px] text-[#667085]">
                description
              </span>
              <p className="text-sm text-[#667085] mt-2">
                Không thể xem trước loại file này
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-[#2563EB] text-white text-sm rounded-full hover:bg-[#1D4ED8] transition-colors"
              >
                Tải xuống
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
