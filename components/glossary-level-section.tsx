"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GlossaryEntryCard, GlossaryEntry } from "./glossary-entry-card";

interface GlossaryLevelSectionProps {
  level: "federal" | "state" | "local";
  entries: GlossaryEntry[];
  allEntries: GlossaryEntry[];
}

const LEVEL_CONFIG = {
  federal: {
    label: "Federal Government",
    description: "Federal officials represent New York in Washington D.C. and make decisions that affect all Americans, including federal spending, immigration, and national defense.",
    id: "federal",
  },
  state: {
    label: "State Government",
    description: "State officials run New York's government, setting laws and policies that affect education, housing, healthcare, transportation, and public safety across all 20 million New Yorkers.",
    id: "state",
  },
  local: {
    label: "Local Government",
    description: "Local officials run the governments closest to where you live — cities, towns, villages, counties, and special districts like school boards. They handle zoning, local taxes, schools, roads, and emergency services.",
    id: "local",
  },
};

const BRANCH_ORDER: Array<"executive" | "legislative" | "judicial"> = [
  "executive",
  "legislative",
  "judicial",
];

const BRANCH_LABELS: Record<string, string> = {
  executive: "Executive",
  legislative: "Legislative",
  judicial: "Judicial",
};

export function GlossaryLevelSection({
  level,
  entries,
  allEntries,
}: GlossaryLevelSectionProps) {
  const [allExpanded, setAllExpanded] = useState(false);
  const config = LEVEL_CONFIG[level];

  const byBranch: Record<string, GlossaryEntry[]> = {};
  for (const entry of entries) {
    if (!byBranch[entry.branch]) byBranch[entry.branch] = [];
    byBranch[entry.branch].push(entry);
  }

  const branches = BRANCH_ORDER.filter((b) => byBranch[b]?.length > 0);

  return (
    <section id={config.id} className="scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A1A1A]">{config.label}</h2>
          <p className="text-[#6B7280] mt-1 text-sm max-w-2xl">{config.description}</p>
        </div>
        <button
          onClick={() => setAllExpanded(!allExpanded)}
          className="flex-shrink-0 flex items-center gap-1.5 text-sm font-medium text-[#2D6A4F] hover:text-[#2e5120] border border-[#2D6A4F] rounded-none px-3 py-1.5 transition-colors"
        >
          {allExpanded ? (
            <><ChevronUp size={14} /> Collapse all</>
          ) : (
            <><ChevronDown size={14} /> Expand all</>
          )}
        </button>
      </div>

      <div className="space-y-8">
        {branches.map((branch) => (
          <div key={branch}>
            <h3 className="text-base font-bold text-[#6B7280] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  branch === "executive"
                    ? "bg-amber-500"
                    : branch === "legislative"
                    ? "bg-teal-500"
                    : "bg-purple-500"
                }`}
              />
              {BRANCH_LABELS[branch]}
            </h3>
            <div className="space-y-4">
              {byBranch[branch].map((entry) => (
                <div key={entry.id} id={entry.id} className="scroll-mt-20">
                  <GlossaryEntryCard
                    entry={entry}
                    allEntries={allEntries}
                    forceExpanded={allExpanded}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
