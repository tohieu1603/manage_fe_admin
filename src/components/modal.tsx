"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Renders into document.body via Portal so any ancestor `transform` /
// `filter` / `contain` style never breaks the centering. Adds an entrance
// animation, scroll lock, ESC + backdrop close.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm modal-fade"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto modal-pop"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-ink-100">
          <div>
            <div className="text-base font-semibold text-ink-800">{title}</div>
            {description && <div className="text-xs text-ink-500 mt-0.5">{description}</div>}
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-md p-1 -mt-0.5 -mr-1"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
      <style jsx>{`
        .modal-fade {
          animation: modalFadeIn 0.18s ease-out;
        }
        .modal-pop {
          animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}

// === Form widgets — consistent height, focus ring, helper text ===

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-ink-600 mb-1.5 block">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && !error && <div className="text-[11px] text-ink-500 mt-1">{hint}</div>}
      {error && <div className="text-[11px] text-danger-600 font-medium mt-1">{error}</div>}
    </label>
  );
}

const inputBase =
  "w-full px-3.5 h-10 text-sm bg-white border border-ink-200 rounded-lg outline-none transition-colors " +
  "hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-ink-400";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${inputBase} appearance-none pr-10 cursor-pointer ${props.className ?? ""}`}
      />
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full px-3.5 py-2.5 text-sm bg-white border border-ink-200 rounded-lg outline-none " +
        "hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-ink-400 min-h-[88px] " +
        (props.className ?? "")
      }
    />
  );
}

// === Modal footer — consistent button row across forms ===
export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-ink-100">{children}</div>
  );
}

export function Btn({
  variant = "secondary",
  loading,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}) {
  const cls =
    "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm",
    secondary: "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50 hover:border-ink-300",
    danger: "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm",
  };
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`${cls} ${styles[variant]} ${rest.className ?? ""}`}
    >
      {loading && (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
