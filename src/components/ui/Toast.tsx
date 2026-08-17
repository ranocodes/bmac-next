"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "info";
}

interface ConfirmOptions {
  confirmText?: string;
  variant?: "destructive" | "default";
}

interface ToastCtx {
  toast: (message: string, type?: "success" | "error" | "info") => void;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<ToastCtx>({ toast: () => {}, confirm: () => Promise.resolve(false) });

export function useToast() {
  return useContext(Ctx);
}

const typeStyles: Record<Toast["type"], string> = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/80 dark:border-green-800 dark:text-green-300",
  info: "bg-card border-border/50 text-secondary",
};

const typeIcons: Record<Toast["type"], React.ReactNode> = {
  success: <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />,
  info: <Info size={18} className="mt-0.5 shrink-0 text-muted-foreground" />,
};

const typeDurations: Record<Toast["type"], number> = {
  success: 4000,
  info: 3500,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [errors, setErrors] = useState<{ id: number; message: string }[]>([]);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [confirmBtn, setConfirmBtn] = useState("Delete");
  const [confirmVariant, setConfirmVariant] = useState<"destructive" | "default">("destructive");
  const [confirmResolve, setConfirmResolve] = useState<((v: boolean) => void) | null>(null);

  const dismissError = useCallback((id: number) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    if (type === "error") {
      setErrors(prev => [...prev, { id, message }]);
      return;
    }
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), typeDurations[type]);
  }, []);

  const confirm = useCallback((message: string, options?: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmMsg(message);
      setConfirmBtn(options?.confirmText || "Delete");
      setConfirmVariant(options?.variant || "destructive");
      setConfirmResolve(() => (v: boolean) => {
        setConfirmMsg(null);
        resolve(v);
      });
    });
  }, []);

  return (
    <Ctx value={{ toast, confirm }}>
      {children}

      {errors.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/20 backdrop-blur-sm px-4 pointer-events-auto">
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {errors.map((e, i) => (
              <div
                key={e.id}
                role="alert"
                style={{ zIndex: 100 - i }}
                className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-destructive/5 border border-destructive/25 shadow-2xl backdrop-blur-xl animate-in zoom-in-90"
              >
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-destructive" />
                <p className="text-sm text-destructive flex-1 leading-snug font-medium">{e.message}</p>
                <button
                  onClick={() => dismissError(e.id)}
                  className="shrink-0 text-destructive/50 hover:text-destructive transition-opacity"
                  aria-label="Dismiss error"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/20 backdrop-blur-sm px-4">
          <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full shadow-2xl">
            <p className="text-sm text-secondary font-medium mb-6">{confirmMsg}</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => confirmResolve?.(false)} className="h-9 px-4 rounded-xl border border-input text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-all">Cancel</button>
              <button onClick={() => confirmResolve?.(true)} className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all ${confirmVariant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>{confirmBtn}</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-6 right-4 left-4 z-[100] flex flex-col gap-3 sm:left-auto sm:right-6 sm:max-w-sm sm:w-auto pointer-events-none">
        {toasts.map((t, i) => (
          <div
            key={t.id}
            style={{ zIndex: 100 - i }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top ${typeStyles[t.type]}`}
          >
            {typeIcons[t.type]}
            <p className="text-sm flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="shrink-0 opacity-40 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </Ctx>
  );
}
