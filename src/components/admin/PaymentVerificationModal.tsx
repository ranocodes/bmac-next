"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface PaymentVerificationModalProps {
  attendee: {
    ticketId: string;
    payerName: string;
    payerEmail: string;
    reference: string;
    amount: number;
    quantity: number;
    createdAt: string;
  };
  onConfirm: (ticketId: string) => Promise<void>;
  onClose: () => void;
}

export default function PaymentVerificationModal({ attendee, onConfirm, onClose }: PaymentVerificationModalProps) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    await onConfirm(attendee.ticketId);
    setBusy(false);
  }

  const currency = "₦";
  const displayAmount = attendee.amount ? `${currency}${(Number(attendee.amount) * attendee.quantity / 100).toLocaleString("en-NG")}` : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-secondary">Verify Payment</h2>
          <p className="text-sm text-muted-foreground mt-1">Manual confirmation for pending bank transfers or cash.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between border-b border-border/50 pb-3">
            <span className="text-sm text-muted-foreground">Attendee</span>
            <span className="text-sm font-semibold text-secondary">{attendee.payerName || "—"}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-3">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-semibold text-secondary">{attendee.payerEmail}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-3">
            <span className="text-sm text-muted-foreground">Reference</span>
            <span className="text-sm font-mono text-secondary">{attendee.reference}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-3">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-sm font-semibold text-secondary">{displayAmount} (x{attendee.quantity})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="text-sm font-semibold text-secondary">{new Date(attendee.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-border text-sm font-semibold text-secondary hover:bg-muted transition-colors disabled:opacity-50"
          >
            <XCircle size={16} /> Keep Pending
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> {busy ? "Confirming…" : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
