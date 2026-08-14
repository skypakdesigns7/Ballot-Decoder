"use client";

import { useState, useMemo } from "react";
import proposalsData from "@/data/ballot-proposals.json";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stakeholder {
  name: string;
  type: string;
  reason: string;
}

interface Proposal {
  id: string;
  year: number;
  election_date: string;
  status: "passed" | "failed" | "upcoming";
  scope: "statewide" | "nyc_only";
  number: string;
  title: string;
  official_title: string;
  summary: string;
  plain_english_explanation: string;
  implications: string;
  affected_groups: { tags: string[]; detail: string };
  vote_result: {
    outcome: "passed" | "failed" | "pending";
    yes_percent: number | null;
    no_percent: number | null;
    note: string | null;
  };
  supporters: Stakeholder[];
  opponents: Stakeholder[];
  learn_more_url: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TAGS = [
  "Renters",
  "Homeowners",
  "Taxpayers",
  "Students",
  "Businesses",
  "Union Workers",
  "Developers",
  "NYC Residents",
  "Upstate Residents",
  "Local Government",
];

const STATUS_CONFIG = {
  passed: {
    label: "Passed",
    icon: CheckCircle,
    classes: "bg-emerald-50 border-emerald-300 text-emerald-800",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    classes: "bg-rose-50 border-rose-300 text-rose-800",
    badge: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
  },
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    classes: "bg-amber-50 border-amber-300 text-amber-800",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-400",
  },
};

const SCOPE_LABELS: Record<string, string> = {
  statewide: "Statewide",
  nyc_only: "NYC Only",
};

const STAKEHOLDER_TYPE_LABELS: Record<string, string> = {
  union: "Union",
  nonprofit: "Nonprofit",
  elected_official: "Elected Official",
  business_group: "Business Group",
  advocacy: "Advocacy",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "passed" | "failed" | "upcoming" }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}
    >
      <Icon size={13} />
      {cfg.label}
    </span>
  );
}

function ScopeBadge({ scope }: { scope: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#E9F5EE] text-[#2e5120]">
      {SCOPE_LABELS[scope] ?? scope}
    </span>
  );
}

function VoteBar({
  yes,
  no,
}: {
  yes: number | null;
  no: number | null;
}) {
  if (yes === null || no === null) return null;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-emerald-700">Yes — {yes}%</span>
        <span className="text-rose-700">No — {no}%</span>
      </div>
      <div className="h-3 rounded-full bg-rose-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${yes}%` }}
        />
      </div>
    </div>
  );
}

function StakeholderRow({ person, side }: { person: Stakeholder; side: "for" | "against" }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-[#F0F0F0] last:border-0">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
          side === "for" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}
      >
        {side === "for" ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-[#1A1A1A] text-sm">{person.name}</span>
          <span className="text-xs text-[#6B7280] bg-[#F0F0F0] rounded px-1.5 py-0.5">
            {STAKEHOLDER_TYPE_LABELS[person.type] ?? person.type}
          </span>
        </div>
        <p className="text-sm text-[#6B7280] leading-snug">{person.reason}</p>
      </div>
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[proposal.status];

  return (
    <article
      className={`bg-[#f7fcf5] rounded-none border-2 shadow-sm transition-shadow hover:shadow-md ${
        proposal.status === "failed"
          ? "border-rose-200"
          : proposal.status === "upcoming"
          ? "border-amber-200"
          : "border-[#D1E8DA]"
      }`}
    >
      {/* ── Card header ── */}
      <div className="p-6 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-block rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
            <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.02em" }}>
              {proposal.number}
            </span>
          </div>
          <ScopeBadge scope={proposal.scope} />
          <StatusBadge status={proposal.status} />
          <span className="text-xs text-[#6B7280] ml-auto">{proposal.election_date}</span>
        </div>

        <h2 className="text-xl font-extrabold text-[#2e5120] leading-tight mb-1">
          {proposal.title}
        </h2>
        <p className="text-xs text-[#6B7280] italic mb-4 leading-snug">
          {proposal.official_title}
        </p>

        {/* Affected groups */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {proposal.affected_groups.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#E9F5EE] text-[#2e5120] rounded-full px-2.5 py-0.5 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Summary */}
        <p className="text-[#1A1A1A] text-sm leading-relaxed">{proposal.summary}</p>

        {/* Vote result (always visible) */}
        {proposal.vote_result.outcome !== "pending" && (
          <div
            className={`mt-4 rounded-none border p-3 ${cfg.classes}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <cfg.icon size={16} />
              <span className="font-bold text-sm">{cfg.label}</span>
            </div>
            <VoteBar
              yes={proposal.vote_result.yes_percent}
              no={proposal.vote_result.no_percent}
            />
            {proposal.vote_result.note && (
              <p className="text-xs mt-2 opacity-80">{proposal.vote_result.note}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Expandable detail ── */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-[#F0F0F0] pt-5 space-y-5">
          {/* Plain English Explanation */}
          <section>
            <h3 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-2">
              What This Actually Means
            </h3>
            <p className="text-sm text-[#1A1A1A] leading-relaxed">
              {proposal.plain_english_explanation}
            </p>
          </section>

          {/* Implications */}
          <section>
            <h3 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-2">
              If Passed vs. If Failed
            </h3>
            <p className="text-sm text-[#1A1A1A] leading-relaxed">{proposal.implications}</p>
          </section>

          {/* Affected Groups detail */}
          <section>
            <h3 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-2">
              Who's Affected
            </h3>
            <p className="text-sm text-[#1A1A1A] leading-relaxed">
              {proposal.affected_groups.detail}
            </p>
          </section>

          {/* Supporters & Opponents */}
          {(proposal.supporters.length > 0 || proposal.opponents.length > 0) && (
            <section>
              <h3 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-3">
                Supporters & Opponents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proposal.supporters.length > 0 && (
                  <div className="bg-emerald-50 rounded-none p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsUp size={14} className="text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        Supporters ({proposal.supporters.length})
                      </span>
                    </div>
                    <div>
                      {proposal.supporters.map((s) => (
                        <StakeholderRow key={s.name} person={s} side="for" />
                      ))}
                    </div>
                  </div>
                )}
                {proposal.opponents.length > 0 && (
                  <div className="bg-rose-50 rounded-none p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsDown size={14} className="text-rose-700" />
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                        Opponents ({proposal.opponents.length})
                      </span>
                    </div>
                    <div>
                      {proposal.opponents.map((o) => (
                        <StakeholderRow key={o.name} person={o} side="against" />
                      ))}
                    </div>
                  </div>
                )}
                {proposal.opponents.length === 0 && proposal.supporters.length > 0 && (
                  <div className="bg-[#F9F9F9] rounded-none p-4 flex items-center justify-center text-sm text-[#6B7280]">
                    No significant organized opposition recorded.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Learn more */}
          {proposal.learn_more_url && (
            <a
              href={proposal.learn_more_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2e5120] hover:underline"
            >
              Official source / Learn more <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-[#F0F0F0] text-sm font-medium text-[#2e5120] hover:bg-[#F6FBF8] transition-colors rounded-b-2xl"
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Show less <ChevronUp size={16} />
          </>
        ) : (
          <>
            Full explanation, supporters & opponents <ChevronDown size={16} />
          </>
        )}
      </button>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BallotProposalsPage() {
  const [scopeFilter, setScopeFilter] = useState<"all" | "statewide" | "nyc_only">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed" | "upcoming">("all");
  const [tagFilters, setTagFilters] = useState<Set<string>>(new Set());

  const proposals = proposalsData as Proposal[];

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (scopeFilter !== "all" && p.scope !== scopeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (tagFilters.size > 0) {
        const hasTag = Array.from(tagFilters).some((t) =>
          p.affected_groups.tags.includes(t)
        );
        if (!hasTag) return false;
      }
      return true;
    });
  }, [scopeFilter, statusFilter, tagFilters, proposals]);

  function toggleTag(tag: string) {
    setTagFilters((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  function clearFilters() {
    setScopeFilter("all");
    setStatusFilter("all");
    setTagFilters(new Set());
  }

  const hasFilters =
    scopeFilter !== "all" || statusFilter !== "all" || tagFilters.size > 0;

  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-[#081f00] leading-tight">
          Ballot Proposals
        </h1>
        <p className="text-[#2e5120] text-base mt-1">
          Proposed changes to NY's laws and constitution — explained in plain English
        </p>
      </div>

      {/* ── Reference year banner ── */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-none p-4 mb-8">
        <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">
            Currently showing 2025 ballot proposals as reference
          </p>
          <p className="text-amber-700 text-sm mt-0.5">
            These are the six proposals that appeared on the November 4, 2025 ballot in New York.
            2026 statewide and local proposals will be added here when officially certified by the
            New York State Board of Elections.
          </p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5 mb-8 shadow-sm space-y-4">
        {/* Row 1: Scope + Status */}
        <div className="grid grid-cols-2 gap-3">
          {/* Scope */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide block mb-2">
              Scope
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  { val: "all", label: "All" },
                  { val: "statewide", label: "Statewide" },
                  { val: "nyc_only", label: "NYC Only" },
                ] as const
              ).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setScopeFilter(val)}
                  className={`px-3 py-1.5 rounded-none text-xs font-semibold border transition-colors ${
                    scopeFilter === val
                      ? "bg-[#2e5120] text-white border-[#2e5120]"
                      : "bg-[#f7fcf5] text-[#1A1A1A] border-[#E0E0E0] hover:border-[#2e5120]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide block mb-2">
              Status
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  { val: "all", label: "All" },
                  { val: "passed", label: "Passed" },
                  { val: "failed", label: "Failed" },
                  { val: "upcoming", label: "Upcoming" },
                ] as const
              ).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val)}
                  className={`px-3 py-1.5 rounded-none text-xs font-semibold border transition-colors ${
                    statusFilter === val
                      ? "bg-[#2e5120] text-white border-[#2e5120]"
                      : "bg-[#f7fcf5] text-[#1A1A1A] border-[#E0E0E0] hover:border-[#2e5120]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Tag multi-select */}
        <div>
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide block mb-2">
            Who it affects
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  tagFilters.has(tag)
                    ? "bg-[#52B788] text-white border-[#52B788]"
                    : "bg-[#f7fcf5] text-[#1A1A1A] border-[#E0E0E0] hover:border-[#52B788]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Result count + clear */}
        <div className="flex items-center justify-between pt-1 border-t border-[#F0F0F0]">
          <p className="text-sm text-[#6B7280]">
            Showing{" "}
            <span className="font-bold text-[#1A1A1A]">{filtered.length}</span> of{" "}
            <span className="font-bold text-[#1A1A1A]">{proposals.length}</span> proposals
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#6B7280] hover:text-[#1A1A1A] underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Proposal cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">
          <p className="text-xl font-semibold mb-2">No proposals match your filters</p>
          <p>Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      {/* ── Bottom note ── */}
      <div className="mt-10 text-center text-xs text-[#6B7280]">
        <p>
          Proposal data sourced from{" "}
          <a
            href="https://vote.nyc"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#2e5120]"
          >
            vote.nyc
          </a>{" "}
          and{" "}
          <a
            href="https://elections.ny.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#2e5120]"
          >
            elections.ny.gov
          </a>
          . Always verify with official sources.
        </p>
      </div>
    </div>
    </div>
  );
}
