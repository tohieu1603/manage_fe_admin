"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, AlertCircle } from "lucide-react";

const PRESETS = [
  { label: "Điều phối viên", email: "dispatcher@coolops.vn" },
  { label: "Chủ doanh nghiệp", email: "owner@coolops.vn" },
  { label: "Nhân viên CSKH", email: "cskh@coolops.vn" },
  { label: "Kỹ thuật viên", email: "tech1@coolops.vn" },
  { label: "Quản trị", email: "admin@coolops.vn" },
];

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("dispatcher@coolops.vn");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErr(json.message ?? "Đăng nhập thất bại");
        return;
      }
      const target = params.get("from") || "/dashboard";
      router.replace(target);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 via-ink-50 to-violet-50 p-6">
      <div className="w-full max-w-md card p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white grid place-items-center font-bold text-lg">C</div>
          <div>
            <div className="font-bold text-ink-800 text-lg">CoolOps</div>
            <div className="text-xs text-ink-500 -mt-0.5">Hệ thống quản lý dịch vụ điều hòa</div>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1">Đăng nhập</h1>
        <p className="text-sm text-ink-500 mb-5">Sử dụng tài khoản BE đã seed</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-ink-600 mb-1 block">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-600 mb-1 block">Mật khẩu</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {err && (
            <div className="flex gap-2 items-start p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-ink-150">
          <p className="text-xs text-ink-500 mb-2">Tài khoản demo (mật khẩu: Admin@123)</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => setEmail(p.email)}
                className="text-[11px] px-2 py-1 rounded-md bg-ink-100 hover:bg-ink-200 text-ink-700"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
