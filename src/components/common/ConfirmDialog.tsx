import { useEffect } from "react";

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  message,
  confirmLabel = "OK",
  cancelLabel = "Không",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded shadow-lg max-w-[340px] w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] text-[var(--color-ink)] leading-relaxed mb-5">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-[var(--color-charcoal)] hover:text-[var(--color-ink-deep)] hover:bg-[var(--color-canvas-soft)] rounded transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-[13px] font-medium rounded transition-colors ${
              danger
                ? "bg-[#FEE2E2] text-[var(--color-danger-deep)] hover:bg-[#FECACA]"
                : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
