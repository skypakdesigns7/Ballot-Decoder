"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import candidatesData from "@/data/candidates.json";
import financeData from "@/data/campaign-finance.json";
import { FinanceCard, type FinanceEntry, type CandidateInfo } from "@/components/finance-card";
import { FinanceFilters, type FinanceFilterState } from "@/components/finance-filters";
import { FinanceExplainer } from "@/components/finance-explainer";
import { formatMoney } from "@/components/funding-fingerprint-bar";

const entries = financeData as FinanceEntry[];
const candidates = candidatesData as CandidateInfo[];

function getCandidateInfo(id: string): CandidateInfo | null {
  return candidates.find((c) => c.id === id) ?? null;
}

const mostRecentDate = entries
  .map((e) => e.data_as_of)
  .sort()
  .at(-1) ?? "—";

export default function MoneyPage() {
  const [filters, setFilters] = useState<FinanceFilterState>({
    search: "",
    level: "all",
    party: "all",
    flag: "all",
    sort: "total_raised_desc",
  });

  const enriched = useMemo(
    () =>
      entries.map((e) => ({ entry: e, candidate: getCandidateInfo(e.candidate_id) })).filter(
        (x): x is { entry: FinanceEntry; candidate: CandidateInfo } => x.candidate !== null
      ),
    []
  );

  const filtered = useMemo(() => {
    let result = enriched;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        ({ candidate }) =>
          candidate.name.toLowerCase().includes(q) ||
          candidate.race.toLowerCase().includes(q)
      );
    }

    if (filters.level !== "all") {
      result = result.filter(({ candidate }) => candidate.level === filters.level);
    }

    if (filters.party !== "all") {
      result = result.filter(({ candidate }) => candidate.party === filters.party);
    }

    if (filters.flag === "dark_money") {
      result = result.filter(({ entry }) => entry.dark_money_flag);
    } else if (filters.flag === "self_funded") {
      result = result.filter(({ entry }) => entry.self_funded_flag);
    } else if (filters.flag === "public_financing") {
      result = result.filter(({ entry }) => entry.public_financing_flag);
    }

    result = [...result].sort((a, b) => {
      if (filters.sort === "total_raised_desc") {
        return (b.entry.totals.total_raised ?? 0) - (a.entry.totals.total_raised ?? 0);
      }
      if (filters.sort === "small_donors_desc") {
        return (b.entry.totals.small_donor_percent ?? 0) - (a.entry.totals.small_donor_percent ?? 0);
      }
      if (filters.sort === "pac_desc") {
        return (b.entry.totals.total_from_pacs ?? 0) - (a.entry.totals.total_from_pacs ?? 0);
      }
      return a.candidate.name.localeCompare(b.candidate.name);
    });

    return result;
  }, [enriched, filters]);

  // Summary stats
  const totalRaised = enriched.reduce(
    (sum, { entry }) => sum + (entry.totals.total_raised ?? 0),
    0
  );
  const pacCount = enriched.filter(({ entry }) => (entry.totals.total_from_pacs ?? 0) > 0).length;
  const darkMoneyCount = enriched.filter(({ entry }) => entry.dark_money_flag).length;

  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#081f00] mb-2">Money in Politics</h1>
        <p className="text-base text-[#2e5120] mb-5">
          Where candidates get their funding — and what those funders typically stand for
        </p>

        {/* Amber callout */}
        <div className="flex items-start gap-3 bg-[#FEF3C7] border border-[#FDE68A] p-4 mb-3">
          <Info size={18} className="text-[#92400E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#92400E] leading-relaxed">
              Campaign finance data is sourced from the FEC and NY Board of Elections public
              filings. Data reflects the most recent available filing period. Always verify at the
              original source.
            </p>
            <p className="text-xs text-[#92400E] mt-1 opacity-75">
              Data last updated: {mostRecentDate}
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total raised across all candidates", value: formatMoney(totalRaised) },
          { label: "Candidates tracked", value: enriched.length.toString() },
          { label: "Receiving PAC funding", value: pacCount.toString() },
          {
            label: "With dark money backing",
            value: darkMoneyCount.toString(),
            warn: darkMoneyCount > 0,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E0E0E0] p-4 shadow-sm"
          >
            <p
              className={`text-2xl font-extrabold ${stat.warn ? "text-[#92400E]" : "text-[#2e5120]"}`}
            >
              {stat.value}
            </p>
            <p className="text-xs text-[#6B7280] mt-1 leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FinanceFilters filters={filters} onChange={setFilters} />

      {/* Result count */}
      <p className="text-sm text-[#6B7280] mb-5">
        Showing {filtered.length} of {enriched.length} candidates
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">
          <p className="text-xl font-semibold mb-2">No candidates match your filters</p>
          <button
            onClick={() =>
              setFilters({ search: "", level: "all", party: "all", flag: "all", sort: "total_raised_desc" })
            }
            className="text-[#2D6A4F] underline hover:no-underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(({ entry, candidate }) => (
            <FinanceCard
              key={entry.candidate_id}
              entry={entry}
              candidate={candidate}
              anchorId={entry.candidate_id}
            />
          ))}
        </div>
      )}

      {/* Dark money warning note */}
      {darkMoneyCount > 0 && (
        <div className="mt-8 flex items-start gap-3 bg-[#FEF3C7] border border-[#FDE68A] p-4">
          <AlertTriangle size={18} className="text-[#92400E] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">
            {darkMoneyCount} candidate{darkMoneyCount > 1 ? "s" : ""} in this list{" "}
            {darkMoneyCount > 1 ? "have" : "has"} received support from dark money organizations —
            nonprofits that spend on elections without disclosing their donors. See the explainer
            below for more information.
          </p>
        </div>
      )}

      {/* Explainer */}
      <FinanceExplainer />
    </div>
    </div>
  );
}
