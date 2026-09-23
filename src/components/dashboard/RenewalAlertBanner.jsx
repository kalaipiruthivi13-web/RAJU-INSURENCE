import React from 'react';
import { AlertCircle, Send, ArrowRight, ShieldAlert, PhoneCall } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Button from '../ui/Button';

export function RenewalAlertBanner() {
  const { policies, sendRenewalReminder, setActiveTab } = useAppData();

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Policies expiring in next 30 days
  const urgentPolicies = policies
    .filter((p) => {
      const exp = new Date(p.expiryDate);
      return exp >= now && exp <= thirtyDaysLater;
    })
    .slice(0, 3);

  if (urgentPolicies.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/90 px-2.5 py-0.5 rounded-full border border-rose-200">
                30-Day Expiry Notice
              </span>
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                {urgentPolicies.length} clients require renewal follow-up
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              Client Retention Trigger Active: Protect policy coverage & maximize renewals
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Send instant WhatsApp or Call reminders to ensure zero lapse and seamless policy continuation.
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setActiveTab('renewals')}
          icon={ArrowRight}
          iconPosition="right"
          className="shrink-0 whitespace-nowrap self-start md:self-auto"
        >
          View Renewals Pipeline
        </Button>
      </div>

      {/* Immediate Policy List Preview */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-rose-200/60">
        {urgentPolicies.map((p) => {
          const expDate = new Date(p.expiryDate);
          const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={p.id}
              className="bg-white/95 p-3.5 rounded-xl border border-rose-100 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {p.clientName}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {diffDays} days left
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {p.companyName} • {p.vehicleNumber || p.policyType}
                </p>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  Premium: ₹{p.premium.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => sendRenewalReminder(p.id, 'WhatsApp')}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => sendRenewalReminder(p.id, 'Call')}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  Call Log
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RenewalAlertBanner;
