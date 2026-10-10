"use client";

import { CreditCard } from "lucide-react";
import { GrCodeSandbox } from "react-icons/gr";

const currentPlan = "free";
const isPaid = currentPlan !== "free";

const planMeta: Record<
  string,
  { label: string; interval: string; renewal: string }
> = {
  pro: {
    label: "Pro plan",
    interval: "Monthly",
    renewal: "Your subscription will auto renew on Apr 14, 2026.",
  },
  growth: {
    label: "Growth plan",
    interval: "Monthly",
    renewal: "Your subscription will auto renew on Apr 14, 2026.",
  },
};

const mockInvoices = [
  { date: "Mar 14, 2026", total: "$19.00", status: "Paid" },
  { date: "Feb 14, 2026", total: "$19.00", status: "Paid" },
];

export default function SettingsBilling() {
  const meta = isPaid ? planMeta[currentPlan] : null;

  return (
    <div className="space-y-4">
      <div className="sp-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg sp-chip">
              <GrCodeSandbox size={50} className="text-white/50" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                {isPaid ? meta!.label : "Free plan"}
              </p>
              {isPaid ? (
                <>
                  <p className="text-sm text-white/50">{meta!.interval}</p>
                  <p className="text-sm text-white/35">{meta!.renewal}</p>
                </>
              ) : (
                <p className="text-sm text-white/35">
                  5 keywords · 100 signals/mo · No card required
                </p>
              )}
            </div>
          </div>
          {isPaid ? (
            <button className="sp-ghost shrink-0">Adjust Plan</button>
          ) : (
            <button className="sp-ghost shrink-0">Upgrade</button>
          )}
        </div>
      </div>

      <div className="sp-card flex items-center justify-between gap-4">
        <div className="space-y-4">
          <h2 className="sp-section !mb-0">Payment</h2>
          {isPaid ? (
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-white/40 shrink-0" />
              <p className="text-sm text-white/70">Visa •••• 8282</p>
            </div>
          ) : (
            <p className="text-sm text-white/35">No payment method on file.</p>
          )}
        </div>
        {isPaid && <button className="sp-ghost">Update</button>}
      </div>

      <div className="sp-card">
        <h2 className="sp-section">Invoices</h2>
        {isPaid ? (
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-3 py-2">
              <span className="text-xs text-white/25 uppercase tracking-wider">
                Date
              </span>
              <span className="text-xs text-white/25 uppercase tracking-wider">
                Total
              </span>
              <span className="text-xs text-white/25 uppercase tracking-wider">
                Status
              </span>
              <span className="text-xs text-white/25 uppercase tracking-wider">
                Actions
              </span>
            </div>
            <div className="h-px bg-white/5" />
            {mockInvoices.map((inv, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-3 py-3 items-center hover:bg-white/3 rounded-lg transition-colors"
              >
                <span className="text-sm text-white/70">{inv.date}</span>
                <span className="text-sm text-white/70">{inv.total}</span>
                <span className="text-sm text-white/50">{inv.status}</span>
                <button className="text-sm text-white/40 underline underline-offset-2 hover:text-white transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/35">No invoices yet.</p>
        )}
      </div>

      {isPaid && (
        <div className="sp-card flex items-center justify-between gap-4">
          <div className="space-y-4">
            <h2 className="sp-section !mb-0">Danger Zone — Cancellation</h2>
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Cancel plan</p>
              <p className="text-sm text-white/35">
                You will lose access to paid features at the end of your billing
                period.
              </p>
            </div>
          </div>
          <button className="text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all shrink-0">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
