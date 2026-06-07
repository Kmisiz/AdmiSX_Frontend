import { useEffect, useCallback } from "react";

interface ToastProps {
  message: { type: "success" | "error"; text: string } | null;
  onDismiss: () => void;
  duration?: number;
}

const Toast = ({ message, onDismiss, duration = 4000 }: ToastProps) => {
  const dismiss = useCallback(() => onDismiss(), [onDismiss]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, dismiss]);

  if (!message) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .toast-animate-in { animation: toastSlideIn 0.3s ease-out forwards; }
      `}</style>
      <div
        className={`fixed top-6 right-6 z-50 max-w-sm px-5 py-3 rounded shadow-lg text-sm font-medium toast-animate-in ${
          message.type === "success"
            ? "bg-[var(--color-success)] text-white"
            : "bg-[var(--color-danger)] text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="flex-1">{message.text}</span>
          <button
            onClick={dismiss}
            className="text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Toast;
