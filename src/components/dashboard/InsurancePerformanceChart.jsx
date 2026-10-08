import React, { useState } from 'react';
import {
  ChevronDown,
  Gauge
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export function InsurancePerformanceChart() {
  const { policies, claims, setActiveTab, navigateToClaimsWithFilter } = useAppData();
  const [selectedLob, setSelectedLob] = useState('Motor'); // Strictly 'Motor' | 'Health'

  // Performance datasets matching the exact visual reference
  const performanceData = {
    Motor: {
      yearly: {
        title: 'Premium Collected',
        value: '₹9,677,593',
        delta: '18%',
        direction: 'down',
        legendTitle: 'Yearly trend',
        bar1Label: 'Collected till Oct 2025-26',
        bar2Label: 'Collected till Oct 2026-27',
        bar1Height: 88,
        bar2Height: 70,
        bar1Color: '#FB7185', // Soft coral pink
        bar2Color: '#E11D48'  // Deep rose red
      },
      monthly: {
        title: 'Premium Collected',
        value: '₹440,148',
        delta: '32%',
        direction: 'up',
        legendTitle: 'Monthly Trend',
        bar1Label: 'Collected in Oct 2025-26',
        bar2Label: 'Collected in Oct 2026-27',
        bar1Height: 58,
        bar2Height: 90,
        bar1Color: '#86EFAC', // Soft light green
        bar2Color: '#22C55E'  // Vibrant green
      },
      policies: {
        title: 'Policies Issued',
        value: '623',
        delta: '3%',
        direction: 'up',
        legendTitle: 'Policy Issued',
        bar1Label: 'Issued till Oct 2025-26',
        bar2Label: 'Issued till Oct 2026-27',
        bar1Height: 74,
        bar2Height: 78,
        bar1Color: '#60A5FA', // Light blue
        bar2Color: '#2563EB'  // Deep primary blue
      },
      icr: {
        title: 'ICR',
        value: '298.43%',
        delta: '',
        direction: 'down',
        isHigh: true,
        legendTitle: 'ICR Values',
        color: '#E11D48'
      }
    },
    Health: {
      yearly: {
        title: 'Premium Collected',
        value: '₹4,821,450',
        delta: '24%',
        direction: 'up',
        legendTitle: 'Yearly trend',
        bar1Label: 'Collected till Oct 2025-26',
        bar2Label: 'Collected till Oct 2026-27',
        bar1Height: 64,
        bar2Height: 85,
        bar1Color: '#FB7185',
        bar2Color: '#E11D48'
      },
      monthly: {
        title: 'Premium Collected',
        value: '₹312,800',
        delta: '15%',
        direction: 'up',
        legendTitle: 'Monthly Trend',
        bar1Label: 'Collected in Oct 2025-26',
        bar2Label: 'Collected in Oct 2026-27',
        bar1Height: 66,
        bar2Height: 82,
        bar1Color: '#86EFAC',
        bar2Color: '#22C55E'
      },
      policies: {
        title: 'Policies Issued',
        value: '248',
        delta: '8%',
        direction: 'up',
        legendTitle: 'Policy Issued',
        bar1Label: 'Issued till Oct 2025-26',
        bar2Label: 'Issued till Oct 2026-27',
        bar1Height: 62,
        bar2Height: 72,
        bar1Color: '#60A5FA',
        bar2Color: '#2563EB'
      },
      icr: {
        title: 'ICR',
        value: '64.12%',
        delta: '',
        direction: 'down',
        isHigh: false,
        legendTitle: 'ICR Values',
        color: '#22C55E'
      }
    }
  };

  const current = performanceData[selectedLob];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 space-y-3">
      {/* Top Header Row matching Reference Image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            MY PERFORMANCE
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Insurance Type:</span>
            <div className="relative inline-block">
              <select
                value={selectedLob}
                onChange={(e) => setSelectedLob(e.target.value)}
                aria-label="Insurance Type"
                className="appearance-none bg-white border border-blue-400 text-slate-800 text-xs font-bold py-1 pl-3 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs hover:border-blue-500 transition-colors"
              >
                <option value="Motor">Motor</option>
                <option value="Health">Health</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center text-slate-400 self-end sm:self-auto">
          <Gauge className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* 4 Cards Grid Layout matching Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Yearly trend */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('quotes')}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('quotes')}
          title="Click to view Quotations & Rates"
          className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                View Rates →
              </span>
              <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5">
                {current.yearly.delta} ↓
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 text-center">
              {current.yearly.title}
            </p>
            <p className="text-xl font-black text-slate-900 text-center tracking-tight mt-0.5 mb-2 group-hover:text-blue-700 transition-colors">
              {current.yearly.value}
            </p>

            {/* 2-Bar Vertical Chart with Horizontal Grid Lines */}
            <div className="h-24 relative flex items-end justify-center gap-3 my-2 px-4">
              {/* Subtle Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
              </div>

              {/* Bar 1 */}
              <div
                className="w-5 rounded-t-sm z-10 transition-all duration-300 shadow-2xs"
                style={{
                  height: `${current.yearly.bar1Height}%`,
                  backgroundColor: current.yearly.bar1Color
                }}
              />
              {/* Bar 2 */}
              <div
                className="w-5 rounded-t-sm z-10 transition-all duration-300 shadow-2xs"
                style={{
                  height: `${current.yearly.bar2Height}%`,
                  backgroundColor: current.yearly.bar2Color
                }}
              />
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-1.5">
              {current.yearly.legendTitle}
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: current.yearly.bar1Color }}
                />
                <span className="truncate">{current.yearly.bar1Label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: current.yearly.bar2Color }}
                />
                <span className="truncate">{current.yearly.bar2Label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Trend */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('quotes')}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('quotes')}
          title="Click to view Quotations & Rates"
          className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                View Trends →
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                {current.monthly.delta} ↑
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 text-center">
              {current.monthly.title}
            </p>
            <p className="text-xl font-black text-slate-900 text-center tracking-tight mt-0.5 mb-2">
              {current.monthly.value}
            </p>

            {/* 2-Bar Vertical Chart with Horizontal Grid Lines */}
            <div className="h-24 relative flex items-end justify-center gap-3 my-2 px-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
              </div>

              {/* Bar 1 */}
              <div
                className="w-5 rounded-t-sm z-10 transition-all duration-300 shadow-2xs"
                style={{
                  height: `${current.monthly.bar1Height}%`,
                  backgroundColor: current.monthly.bar1Color
                }}
              />
              {/* Bar 2 */}
              <div
                className="w-5 rounded-t-sm z-10 transition-all duration-300 shadow-2xs"
                style={{
                  height: `${current.monthly.bar2Height}%`,
                  backgroundColor: current.monthly.bar2Color
                }}
              />
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-1.5">
              {current.monthly.legendTitle}
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: current.monthly.bar1Color }}
                />
                <span className="truncate">{current.monthly.bar1Label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: current.monthly.bar2Color }}
                />
                <span className="truncate">{current.monthly.bar2Label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Policies Issued */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('policies')}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('policies')}
          title="Click to view Active Policies"
          className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                View Policies →
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                {current.policies.delta} ↑
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 text-center">
              {current.policies.title}
            </p>
            <p className="text-xl font-black text-slate-900 text-center tracking-tight mt-0.5 mb-2 group-hover:text-blue-700 transition-colors">
              {current.policies.value}
            </p>

            {/* 2-Bar Vertical Chart with Horizontal Grid Lines */}
            <div className="h-24 relative flex items-end justify-center gap-3 my-2 px-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
                <div className="border-b border-slate-200 w-full" />
              </div>

              {/* Bar 1 */}
              <div
                className="w-5 rounded-t-sm z-10 transition-all duration-300 shadow-2xs"
                style={{
                  height: `${current.policies.bar1Height}%`,
                  backgroundColor: current.policies.bar1Color
                }}
              />
              {/* Bar 2 */}
              <div
                className="w-5 rounded-t-sm z-10 transition-all duration-300 shadow-2xs"
                style={{
                  height: `${current.policies.bar2Height}%`,
                  backgroundColor: current.policies.bar2Color
                }}
              />
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-1.5">
              {current.policies.legendTitle}
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: current.policies.bar1Color }}
                />
                <span className="truncate">{current.policies.bar1Label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: current.policies.bar2Color }}
                />
                <span className="truncate">{current.policies.bar2Label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: ICR (Incurred Claims Ratio with Donut Chart) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateToClaimsWithFilter('SETTLEMENTS')}
          onKeyDown={(e) => e.key === 'Enter' && navigateToClaimsWithFilter('SETTLEMENTS')}
          title="Click to track Claims & Settlements"
          className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Track Claims →
              </span>
              <span className={`text-xs font-bold ${current.icr.isHigh ? 'text-rose-600' : 'text-emerald-600'}`}>
                ↓
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 text-center">
              {current.icr.title}
            </p>
            <p className="text-xl font-black text-slate-900 text-center tracking-tight mt-0.5 mb-2">
              {current.icr.value}
            </p>

            {/* Circular Donut Ring matching Reference */}
            <div className="h-24 flex items-center justify-center my-2">
              <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="4.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  fill="none"
                  stroke={current.icr.color}
                  strokeWidth="5"
                  strokeDasharray="81.68"
                  strokeDashoffset={current.icr.isHigh ? "12" : "28"}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-1.5">
              {current.icr.legendTitle}
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#22C55E] shrink-0" />
                <span>ICR &lt; 75%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-tight">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#E11D48] shrink-0" />
                <span>ICR &gt; 75%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsurancePerformanceChart;
