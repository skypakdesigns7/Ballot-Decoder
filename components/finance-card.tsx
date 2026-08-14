"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FundingFingerprintBar } from "@/components/funding-fingerprint-bar";
import { ControversyItem } from "@/components/controversy-item";
import { formatMoney } from "@/components/funding-fingerprint-bar";
import { getPartyColor } from "@/lib/utils";

export interface FinanceEntry {
  candidate_id: string;
  data_as_of: string;
  data_source: "FEC" | "NYSBOE" | "OpenSecrets" | "Multiple";
  source_url: string;
  cycle: string;
  totals: {
    total_raised: number | null;
    total_spent: number | null;
    cash_on_hand: number | null;
    total_from_pacs: number | null;
    total_from_individuals: number | null;
    total_from_small_donors: number | null;
    small_donor_percent: number | null;
    average_donation: number | null;
  };
  funding_fingerprint: {
    summary: string;
    industry_breakdown: Array<{
      industry: string;
      amount: number;
      percent: number;
      what_they_advocate: string;
    }>;
  };
  top_donors: Array<{
    name: string;
    type: "individual" | "pac" | "super_pac" | "party_committee" | "self_funded";
    amount: number;
    employer_or_affiliation: string | null;
    location: string | null;
  }>;
  pac_and_org_backing: Array<{
    name: string;
    type: "pac" | "super_pac" | "dark_money_nonprofit" | "party_committee" | "union_pac" | "corporate_pac";
    amount_contributed: number | null;
    amount_spent_independently: number | null;
    position: "supporting" | "opposing";
    dark_money: boolean;
    what_they_advocate: string;
  }>;
  controversies: Array<{
    id: string;
    title: string;
    date: string;
    description: string;
    source_name: string;
    source_url: string;
    status: "alleged" | "investigated" | "resolved" | "ongoing";
    candidate_response: string | null;
  }>;
  dark_money_flag: boolean;
  self_funded_flag: boolean;
  public_financing_flag: boolean;
}

export interface CandidateInfo {
  id: string;
  name: string;
  party: string;
  race: string;
  incumbent: boolean;
  level: string;
}

const DONOR_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  pac: "PAC",
  super_pac: "Super PAC",
  party_committee: "Party Committee",
  self_funded: "Self-Funded",
};

const PAC_TYPE_LABELS: Record<string, string> = {
  pac: "PAC",
  super_pac: "Super PAC",
  dark_money_nonprofit: "Dark Money",
  party_committee: "Party Committee",
  union_pac: "Union PAC",
  corporate_pac: "Corporate PAC",
};

function ExpandSection({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#E0E0E0]">
      <button
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-[#2e5120] hover:bg-[#f7fcf5] transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {label}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

interface Props {
  entry: FinanceEntry;
  candidate: CandidateInfo;
  anchorId?: string;
}

export function FinanceCard({ entry, candidate, anchorId }: Props) {
  const { totals, funding_fingerprint, top_donors, pac_and_org_backing, controversies } = entry;

  const pacPercent =
    totals.total_raised && totals.total_from_pacs
      ? Math.round((totals.total_from_pacs / totals.total_raised) * 100)
      : null;

  return (
    <div
      id={anchorId}
      className="bg-white border border-[#E0E0E0] shadow-sm overflow-hidden scroll-mt-20"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#F3F4F6] text-[#6B7280]"
              >
                {candidate.party}
              </span>
              {candidate.incumbent && (
                <Badge className="bg-[#E9F5EE] text-[#2e5120] border border-[#52B788] text-xs">
                  Incumbent
                </Badge>
              )}
              {entry.dark_money_flag && (
                <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-2 py-0.5 rounded-full">
                  <AlertTriangle size={11} /> Dark Money
                </span>
              )}
              {entry.public_financing_flag && (
                <span className="inline-flex items-center gap-1 bg-[#E9F5EE] text-[#2e5120] text-xs font-semibold px-2 py-0.5 rounded-full">
                  ✓ Public Financing
                </span>
              )}
              {entry.self_funded_flag && (
                <Badge className="bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] text-xs">
                  Self-Funded
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">{candidate.name}</h2>
            <p className="text-sm text-[#6B7280]">{candidate.race}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {totals.total_raised !== null ? (
              <p className="text-2xl font-extrabold text-[#2e5120]">
                {formatMoney(totals.total_raised)}
              </p>
            ) : (
              <p className="text-sm text-[#6B7280] italic">Amount not yet filed</p>
            )}
            <p className="text-xs text-[#6B7280] mt-0.5">raised · {entry.cycle}</p>
            <a
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#2D6A4F] mt-1"
            >
              {entry.data_source} <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Funding fingerprint bar */}
        <FundingFingerprintBar segments={funding_fingerprint.industry_breakdown} />

        {/* Summary */}
        {funding_fingerprint.summary && (
          <p className="text-sm text-[#6B7280] italic mt-3 leading-relaxed">
            {funding_fingerprint.summary}
          </p>
        )}

        {/* Quick stats */}
        {(totals.small_donor_percent !== null || pacPercent !== null) && (
          <div className="flex flex-wrap gap-3 mt-3">
            {totals.small_donor_percent !== null && (
              <span className="text-xs bg-[#f7fcf5] border border-[#E0E0E0] px-2.5 py-1 text-[#374151]">
                {totals.small_donor_percent}% from small donors
              </span>
            )}
            {pacPercent !== null && (
              <span className="text-xs bg-[#f7fcf5] border border-[#E0E0E0] px-2.5 py-1 text-[#374151]">
                {pacPercent}% from PACs
              </span>
            )}
            {totals.cash_on_hand !== null && (
              <span className="text-xs bg-[#f7fcf5] border border-[#E0E0E0] px-2.5 py-1 text-[#374151]">
                {formatMoney(totals.cash_on_hand)} cash on hand
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expandable: Top Donors */}
      {top_donors.length > 0 && (
        <ExpandSection label={`Top Donors (${top_donors.length})`}>
          <div className="space-y-2">
            {top_donors.map((donor, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-1.5 border-b border-[#F3F4F6] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-sm text-[#1A1A1A]">{donor.name}</span>
                    <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded">
                      {DONOR_TYPE_LABELS[donor.type] ?? donor.type}
                    </span>
                    {(donor.type === "super_pac" || donor.type === "pac") && (
                      <span
                        className="text-[#D97706]"
                        title="PAC contributions may include bundled individual donations or organizational funds."
                      >
                        ⚠
                      </span>
                    )}
                  </div>
                  {donor.employer_or_affiliation && (
                    <p className="text-xs text-[#6B7280] mt-0.5">{donor.employer_or_affiliation}</p>
                  )}
                  {donor.location && (
                    <p className="text-xs text-[#9CA3AF]">{donor.location}</p>
                  )}
                </div>
                <span className="font-bold text-sm text-[#1A1A1A] flex-shrink-0">
                  {formatMoney(donor.amount)}
                </span>
              </div>
            ))}
          </div>
          <a
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#2D6A4F] hover:underline mt-3"
          >
            View all filings → <ExternalLink size={12} />
          </a>
        </ExpandSection>
      )}

      {/* Expandable: PAC & Org Backing */}
      {pac_and_org_backing.length > 0 && (
        <ExpandSection label={`PAC & Organizational Backing (${pac_and_org_backing.length})`}>
          <div className="space-y-4">
            {pac_and_org_backing.map((org, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-[#1A1A1A]">{org.name}</span>
                  <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded">
                    {PAC_TYPE_LABELS[org.type] ?? org.type}
                  </span>
                  {org.dark_money && (
                    <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      <AlertTriangle size={10} /> Dark Money
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      org.position === "supporting"
                        ? "bg-[#E9F5EE] text-[#2e5120]"
                        : "bg-[#EDE9FE] text-[#5B21B6]"
                    }`}
                  >
                    {org.position === "supporting" ? "Supporting" : "Opposing"}
                  </span>
                </div>
                {org.dark_money && (
                  <p className="text-xs text-[#6B7280] mb-1">
                    Amount undisclosed — this organization is not required to disclose its donors.
                  </p>
                )}
                {!org.dark_money && (
                  <p className="text-xs text-[#374151] mb-1">
                    {org.amount_contributed !== null && (
                      <span>Contributed: {formatMoney(org.amount_contributed)}</span>
                    )}
                    {org.amount_contributed !== null && org.amount_spent_independently !== null && (
                      <span> · </span>
                    )}
                    {org.amount_spent_independently !== null && (
                      <span>Independent: {formatMoney(org.amount_spent_independently)}</span>
                    )}
                  </p>
                )}
                <p className="text-xs text-[#6B7280] leading-relaxed">{org.what_they_advocate}</p>
              </div>
            ))}
          </div>
        </ExpandSection>
      )}

      {/* Expandable: Financial Controversies */}
      {controversies.length > 0 && (
        <ExpandSection label={`Financial Controversies (${controversies.length})`}>
          <div className="space-y-5">
            {controversies.map((c) => (
              <ControversyItem key={c.id} controversy={c} />
            ))}
          </div>
        </ExpandSection>
      )}

      {/* Footer */}
      <div className="border-t border-[#E0E0E0] px-5 py-3 bg-[#f7fcf5] flex items-center justify-between">
        <p className="text-xs text-[#9CA3AF]">Data as of {entry.data_as_of}</p>
        <Link
          href={`/candidates/${candidate.id}`}
          className="text-sm text-[#2D6A4F] hover:underline font-medium"
        >
          View candidate profile →
        </Link>
      </div>
    </div>
  );
}
