"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export const INDUSTRY_COLORS: Record<string, string> = {
  "Real Estate": "#92400E",
  "Finance & Banking": "#1B4332",
  "Labor Unions": "#D97706",
  "Law Firms": "#4B5563",
  "Healthcare": "#0D9488",
  "Energy & Oil": "#78350F",
  "Technology": "#2D6A4F",
  "Education": "#52B788",
  "Small Individual Donors (<$200)": "#6EE7B7",
  "Party Committees": "#7C3AED",
  "Self-Funded": "#6B7280",
  "Other": "#D1D5DB",
  "Agriculture": "#65A30D",
  "Construction": "#B45309",
  "Media & Entertainment": "#BE185D",
  "Retail & Hospitality": "#0891B2",
};

export interface IndustrySegment {
  industry: string;
  amount: number;
  percent: number;
  what_they_advocate: string;
}

interface Props {
  segments: IndustrySegment[];
  compact?: boolean;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

export function FundingFingerprintBar({ segments, compact = false }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!segments || segments.length === 0) {
    return (
      <div className={cn("text-sm text-[#6B7280] italic", compact ? "py-1" : "py-2")}>
        Industry breakdown not yet available.
      </div>
    );
  }

  return (
    <div>
      {/* Stacked bar */}
      <div
        className={cn("flex w-full overflow-hidden", compact ? "h-3" : "h-5")}
        role="img"
        aria-label={`Funding breakdown: ${segments.map((s) => `${s.industry} ${s.percent}%`).join(", ")}`}
      >
        {segments.map((seg, i) => (
          <button
            key={seg.industry}
            style={{
              width: `${seg.percent}%`,
              backgroundColor: INDUSTRY_COLORS[seg.industry] ?? "#D1D5DB",
              minWidth: seg.percent > 0 ? "2px" : undefined,
            }}
            className="relative transition-opacity hover:opacity-75 focus:outline-none focus:opacity-75"
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
            onClick={() => setActiveIdx(activeIdx === i ? null : i)}
            aria-label={`${seg.industry}: ${formatMoney(seg.amount)}, ${seg.percent}%`}
          />
        ))}
      </div>

      {/* Active tooltip */}
      {activeIdx !== null && (
        <div className="mt-2 p-3 bg-white border border-[#E0E0E0] shadow-md text-sm z-10">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-3 h-3 flex-shrink-0"
              style={{ backgroundColor: INDUSTRY_COLORS[segments[activeIdx].industry] ?? "#D1D5DB" }}
            />
            <span className="font-bold text-[#1A1A1A]">{segments[activeIdx].industry}</span>
          </div>
          <div className="text-[#2e5120] font-semibold">
            {formatMoney(segments[activeIdx].amount)} &middot; {segments[activeIdx].percent}%
          </div>
          <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">
            {segments[activeIdx].what_they_advocate}
          </p>
        </div>
      )}

      {/* Legend (full size only) */}
      {!compact && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {segments.map((seg, i) => (
            <button
              key={seg.industry}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
            >
              <span
                className="inline-block w-2.5 h-2.5 flex-shrink-0"
                style={{ backgroundColor: INDUSTRY_COLORS[seg.industry] ?? "#D1D5DB" }}
              />
              {seg.industry}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { formatMoney };
