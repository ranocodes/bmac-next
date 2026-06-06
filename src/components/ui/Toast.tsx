"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastCtx {
  toast: (message: string, type?: Toast["type"]) => void;
  confirm: (message: string) => Promise<boolean>;
}

const Ctx = createContext<ToastCtx>({ toast: () => {}, confirm: () => Promise.resolve(false) });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [confirmResolve, setConfirmResolve] = useState<((v: boolean) => void) | null>(null);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmMsg(message);
      setConfirmResolve(() => (v: boolean) => {
        setConfirmMsg(null);
        resolve(v);
      });
    });
  }, []);

  return (
    <Ctx value={{ toast, confirm }}>
      {children}

      {confirmMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/20 backdrop-blur-sm px-4">
          <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full shadow-2xl">
            <p className="text-sm text-secondary font-medium mb-6">{confirmMsg}</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => confirmResolve?.(false)} className="h-9 px-4 rounded-xl border border-input text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-all">Cancel</button>
              <button onClick={() => confirmResolve?.(true)} className="h-9 px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl animate-in slide-in-from-right ${
            t.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
            t.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
            "bg-card border-border/50 text-secondary"
          }`}>
            {t.type === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" /> :
             t.type === "error" ? <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" /> :
             null}
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </Ctx>
  );
}
