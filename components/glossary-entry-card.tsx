"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface GlossaryEntry {
  id: string;
  title: string;
  short_title: string;
  level: "federal" | "state" | "local";
  branch: "executive" | "legislative" | "judicial";
  scope: string;
  term_years: number;
  term_limit: string | null;
  how_elected: string;
  who_they_answer_to: string;
  summary: string;
  responsibilities: string[];
  real_world_examples: string[];
  daily_life_impact: string;
  related_role_ids: string[];
  officials_page_filter: { level: string; title_keyword: string };
  candidates_page_filter: { race_keyword: string };
}

interface GlossaryEntryCardProps {
  entry: GlossaryEntry;
  allEntries: GlossaryEntry[];
  forceExpanded?: boolean;
}

const LEVEL_BADGE: Record<string, string> = {
  federal: "bg-[#2e5120] text-white",
  state:   "bg-[#2D6A4F] text-white",
  local:   "bg-[#52B788] text-[#2e5120]",
};

const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  state:   "State",
  local:   "Local",
};

const BRANCH_BADGE: Record<string, string> = {
  executive:   "bg-amber-100 text-amber-800",
  legislative: "bg-teal-100 text-teal-800",
  judicial:    "bg-purple-100 text-purple-800",
};

const BRANCH_LABEL: Record<string, string> = {
  executive:   "Executive",
  legislative: "Legislative",
  judicial:    "Judicial",
};

export function GlossaryEntryCard({
  entry,
  allEntries,
  forceExpanded,
}: GlossaryEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = forceExpanded || expanded;

  const relatedEntries = allEntries.filter((e) => entry.related_role_ids.includes(e.id));

  return (
    <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-[#1A1A1A] leading-snug">{entry.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${LEVEL_BADGE[entry.level]}`}>
                {LEVEL_LABEL[entry.level]}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BRANCH_BADGE[entry.branch]}`}>
                {BRANCH_LABEL[entry.branch]}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {entry.term_years}-year term
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mt-2">{entry.scope}</p>
          </div>
        </div>

        <p className="text-[#374151] mt-3 leading-relaxed">{entry.summary}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#2D6A4F] hover:text-[#2e5120] transition-colors"
        >
          {isOpen ? (
            <>See less <ChevronUp size={16} /></>
          ) : (
            <>See responsibilities &amp; impact <ChevronDown size={16} /></>
          )}
        </button>
      </div>

      {/* Expandable section */}
      {isOpen && (
        <div className="bg-[#F0FDF4] border-t border-[#D1FAE5] px-5 sm:px-6 py-5 space-y-5">
          {/* What they do */}
          <div>
            <h4 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-2">What they do</h4>
            <ul className="space-y-1.5">
              {entry.responsibilities.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#374151]">
                  <span className="text-[#52B788] mt-0.5 flex-shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Real decisions */}
          <div>
            <h4 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-2">Real decisions they make</h4>
            <ul className="space-y-1.5">
              {entry.real_world_examples.map((ex, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#374151] leading-relaxed">
                  <span className="text-[#52B788] mt-0.5 flex-shrink-0">•</span>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Daily life impact */}
          <div>
            <h4 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-2">How it affects your daily life</h4>
            <p className="text-sm text-[#374151] leading-relaxed">{entry.daily_life_impact}</p>
          </div>

          {/* Role details */}
          <div>
            <h4 className="text-sm font-bold text-[#2e5120] uppercase tracking-wide mb-2">Role details</h4>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="text-[#6B7280] w-32 flex-shrink-0">How elected:</dt>
                <dd className="text-[#374151]">{entry.how_elected}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#6B7280] w-32 flex-shrink-0">Term length:</dt>
                <dd className="text-[#374151]">{entry.term_years} years{entry.term_limit ? ` — ${entry.term_limit}` : ""}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#6B7280] w-32 flex-shrink-0">Answers to:</dt>
                <dd className="text-[#374151]">{entry.who_they_answer_to}</dd>
              </div>
              {relatedEntries.length > 0 && (
                <div className="flex gap-2 flex-wrap items-start pt-1">
                  <dt className="text-[#6B7280] w-32 flex-shrink-0">Related roles:</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {relatedEntries.map((rel) => (
                      <a
                        key={rel.id}
                        href={`#${rel.id}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#2e5120] hover:bg-[#A7F3D0] transition-colors"
                      >
                        {rel.short_title}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

    </div>
  );
}
