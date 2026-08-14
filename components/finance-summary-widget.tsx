"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { FundingFingerprintBar } from "@/components/funding-fingerprint-bar";
import { formatMoney } from "@/components/funding-fingerprint-bar";
import type { FinanceEntry } from "@/components/finance-card";

interface Props {
  entry: FinanceEntry | null;
  candidateId: string;
}

export function FinanceSummaryWidget({ entry, candidateId }: Props) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  if (!entry || entry.totals.total_raised === null) {
    const sourceUrl = entry?.source_url ?? "https://www.elections.ny.gov/CampaignFinance.html";
    return (
      <div className="bg-[#f7fcf5] border border-[#E0E0E0] p-5">
        <h2 className="font-bold text-[#2e5120] mb-2 text-lg">Campaign Funding</h2>
        <p className="text-sm text-[#6B7280]">
          Campaign finance data for this candidate is not yet available. Check directly at{" "}
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#2D6A4F] hover:underline">
            {entry?.data_source === "FEC" ? "FEC.gov" : "elections.ny.gov"}
          </a>
          .
        </p>
      </div>
    );
  }

  const { totals, funding_fingerprint, controversies, dark_money_flag, public_financing_flag } = entry;

  const pacPercent =
    totals.total_from_pacs !== null
      ? Math.round((totals.total_from_pacs / (totals.total_raised ?? 1)) * 100)
      : null;

  return (
    <div className="bg-white border border-[#E0E0E0]">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="font-bold text-[#2e5120] text-lg">Campaign Funding</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <a
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#2D6A4F]"
            >
              {entry.data_source} <ExternalLink size={10} />
            </a>
            <span className="text-[#D1D5DB] text-xs">·</span>
            <Link
              href={`/money#${candidateId}`}
              className="text-xs text-[#2D6A4F] hover:underline font-medium"
            >
              Full finance data →
            </Link>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-[#2e5120]">
            {formatMoney(totals.total_raised!)}
          </p>
          <p className="text-xs text-[#6B7280]">raised · {entry.cycle}</p>
        </div>
      </div>

      {/* Fingerprint bar */}
      <div className="px-5 pb-3">
        <FundingFingerprintBar segments={funding_fingerprint.industry_breakdown} compact />

        {/* Expand industry list */}
        {funding_fingerprint.industry_breakdown.length > 0 && (
          <button
            className="mt-2 text-xs text-[#2D6A4F] hover:underline flex items-center gap-1"
            onClick={() => setBreakdownOpen(!breakdownOpen)}
          >
            {breakdownOpen ? "Hide" : "Show"} breakdown
            {breakdownOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {breakdownOpen && (
          <div className="mt-3 space-y-1.5">
            {funding_fingerprint.industry_breakdown.map((seg) => (
              <div key={seg.industry} className="flex items-start gap-2 text-xs">
                <span className="inline-block w-2.5 h-2.5 flex-shrink-0 mt-0.5 rounded-sm"
                  style={{ backgroundColor: "#6B7280" }}
                />
                <div className="flex-1">
                  <span className="font-medium text-[#1A1A1A]">{seg.industry}</span>
                  <span className="text-[#6B7280] ml-1.5">{formatMoney(seg.amount)} · {seg.percent}%</span>
                  <p className="text-[#9CA3AF] leading-relaxed mt-0.5">{seg.what_they_advocate}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!breakdownOpen && funding_fingerprint.summary && (
          <p className="text-xs text-[#6B7280] italic mt-2 leading-relaxed">
            {funding_fingerprint.summary}
          </p>
        )}
      </div>

      {/* Quick stat chips */}
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        {totals.small_donor_percent !== null && (
          <span className="text-xs bg-[#f7fcf5] border border-[#E0E0E0] px-2.5 py-1 text-[#374151]">
            {totals.small_donor_percent}% small donors
          </span>
        )}
        {pacPercent !== null && (
          <span className="text-xs bg-[#f7fcf5] border border-[#E0E0E0] px-2.5 py-1 text-[#374151]">
            {pacPercent}% from PACs
          </span>
        )}
        {dark_money_flag && (
          <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-2.5 py-1">
            <AlertTriangle size={10} /> Dark money support
          </span>
        )}
        {public_financing_flag && (
          <span className="inline-flex items-center gap-1 bg-[#E9F5EE] text-[#2e5120] text-xs font-semibold px-2.5 py-1">
            ✓ Public financing participant
          </span>
        )}
      </div>

      {/* Controversy callout */}
      {controversies.length > 0 && (
        <div className="mx-5 mb-4 bg-[#FEF3C7] border border-[#FDE68A] px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-[#92400E] font-medium">
            {controversies.length} financial {controversies.length === 1 ? "controversy" : "controversies"} documented.
          </p>
          <Link
            href={`/money#${candidateId}`}
            className="text-xs text-[#92400E] underline hover:no-underline flex-shrink-0"
          >
            See full details →
          </Link>
        </div>
      )}
    </div>
  );
}
