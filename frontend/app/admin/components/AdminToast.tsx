"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Toast = { id: number; message: string; type: "success" | "error" };

const ToastContext = createContext<{
  showToast: (message: string, type?: "success" | "error") => void;
} | null>(null);

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded border border-divider-strong bg-surface-container-high px-6 py-4 shadow-xl"
          >
            <span
              className={`material-symbols-outlined ${
                toast.type === "success" ? "text-primary" : "text-error"
              }`}
            >
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <p className="font-label-caps text-label-caps text-primary">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}
