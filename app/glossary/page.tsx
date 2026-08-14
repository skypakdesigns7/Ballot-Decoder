"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import glossaryData from "@/data/glossary.json";
import { GlossarySearch } from "@/components/glossary-search";
import { GlossaryLevelSection } from "@/components/glossary-level-section";
import { GlossaryEntryCard, GlossaryEntry } from "@/components/glossary-entry-card";
import { ExternalLink } from "lucide-react";

const entries = glossaryData as GlossaryEntry[];

const LEVELS: Array<"federal" | "state" | "local"> = ["federal", "state", "local"];
const LEVEL_LABELS = { federal: "Federal", state: "State", local: "Local" };

function searchGlossary(allEntries: GlossaryEntry[], query: string): GlossaryEntry[] {
  if (!query.trim()) return allEntries;
  const q = query.toLowerCase();
  return allEntries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(q) ||
      entry.short_title.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q) ||
      entry.responsibilities.some((r) => r.toLowerCase().includes(q)) ||
      entry.branch.toLowerCase().includes(q) ||
      entry.level.toLowerCase().includes(q)
  );
}

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState<"all" | "federal" | "state" | "local">("all");
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});
  const toggleBranch = useCallback((title: string) => {
    setOpenBranches((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (searchQuery.trim()) {
      result = searchGlossary(result, searchQuery);
    } else if (activeLevel !== "all") {
      result = result.filter((e) => e.level === activeLevel);
    }
    return result;
  }, [searchQuery, activeLevel]);

  const isSearchActive = searchQuery.trim().length > 0;

  const levelCounts = useMemo(
    () => ({
      federal: entries.filter((e) => e.level === "federal").length,
      state: entries.filter((e) => e.level === "state").length,
      local: entries.filter((e) => e.level === "local").length,
    }),
    []
  );

  const groupedByLevel = useMemo(() => {
    const groups: Record<string, GlossaryEntry[]> = {};
    for (const entry of filteredEntries) {
      if (!groups[entry.level]) groups[entry.level] = [];
      groups[entry.level].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  const levelsToShow = LEVELS.filter((l) => groupedByLevel[l]?.length > 0);

  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#081f00]">Elected Positions Glossary</h1>
        <p className="text-base text-[#2e5120] mt-2">Every elected role in New York — explained in plain English</p>
        <p className="text-sm text-[#2e5120] mt-3 max-w-2xl">
          New York voters elect officials at three levels of government: federal, state, and local.<br />Here&apos;s what each role does and why it matters to your daily life.
        </p>
      </div>

      {/* Government structure explainer */}
      <section className="mb-10 pt-2">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">How NY&apos;s Government is Structured</h2>
        <p className="text-[#6B7280] mb-6">The three branches of government and how they check each other</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {[
            {
              title: "Executive",
              color: "border-amber-400",
              bg: "bg-amber-50",
              dot: "bg-amber-500",
              desc: "The executive branch carries out laws and runs the day-to-day operations of government. At the state level, the Governor leads the executive branch. The executive branch proposes the budget, appoints agency heads, and signs or vetoes legislation passed by the legislature.",
            },
            {
              title: "Legislative",
              color: "border-teal-400",
              bg: "bg-teal-50",
              dot: "bg-teal-500",
              desc: "The legislative branch writes and passes laws, and approves the government budget. In New York, the Legislature consists of the State Senate (63 members) and the State Assembly (150 members). They check the executive branch by overriding vetoes and controlling appropriations.",
            },
            {
              title: "Judicial",
              color: "border-purple-400",
              bg: "bg-purple-50",
              dot: "bg-purple-500",
              desc: "The judicial branch interprets laws and resolves disputes. New York's court system is uniquely named — the Court of Appeals is the highest court, while 'Supreme Court' refers to a trial court. Judges check the other branches by striking down unconstitutional laws.",
            },
          ].map((branch) => {
            const isOpen = !!openBranches[branch.title];
            return (
              <div key={branch.title} className={`rounded-none border-2 ${branch.color} ${branch.bg}`}>
                <button
                  onClick={() => toggleBranch(branch.title)}
                  className="w-full flex items-center justify-between gap-2 p-5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${branch.dot}`} />
                    <h3 className="font-bold text-[#1A1A1A]">{branch.title}</h3>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-[#6B7280] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#6B7280] flex-shrink-0" />}
                </button>
                {isOpen && (
                  <p className="text-sm text-[#374151] leading-relaxed px-5 pb-5">{branch.desc}</p>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-[#6B7280]">
          For official government information, visit{" "}
          <a
            href="https://www.ny.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2D6A4F] hover:underline inline-flex items-center gap-1"
          >
            ny.gov <ExternalLink size={12} />
          </a>
        </p>
      </section>

      {/* Search */}
      <div className="mb-6">
        <GlossarySearch
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={isSearchActive ? filteredEntries.length : undefined}
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { num: "26", label: "U.S. House Seats" },
          { num: "63", label: "State Senate Seats" },
          { num: "150", label: "Assembly Seats" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-[#2e5120]">{stat.num}</div>
            <div className="text-sm text-[#6B7280] mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Level tabs — hidden during search */}
      {!isSearchActive && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {(["all", ...LEVELS] as const).map((lvl) => {
            const label =
              lvl === "all"
                ? `All (${entries.length})`
                : `${LEVEL_LABELS[lvl]} (${levelCounts[lvl]})`;
            return (
              <button
                key={lvl}
                onClick={() => {
                  setActiveLevel(lvl);
                  if (lvl !== "all") {
                    setTimeout(() => {
                      document.getElementById(lvl)?.scrollIntoView({ behavior: "smooth" });
                    }, 0);
                  }
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-none text-sm font-semibold transition-colors ${
                  activeLevel === lvl
                    ? "bg-[#2e5120] text-white"
                    : "bg-[#f7fcf5] border border-[#E0E0E0] text-[#374151] hover:bg-[#F0FDF4] hover:border-[#2D6A4F]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="space-y-14">
        {isSearchActive ? (
          levelsToShow.length === 0 ? null : (
            levelsToShow.map((level) => (
              <div key={level}>
                <h2 className="text-lg font-bold text-[#6B7280] uppercase tracking-wider mb-4">
                  {LEVEL_LABELS[level]}
                </h2>
                <div className="space-y-4">
                  {groupedByLevel[level].map((entry) => (
                    <div key={entry.id} id={entry.id}>
                      <GlossaryEntryCard
                        entry={entry}
                        allEntries={entries}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          levelsToShow.map((level) => (
            <GlossaryLevelSection
              key={level}
              level={level}
              entries={groupedByLevel[level]}
              allEntries={entries}
            />
          ))
        )}
      </div>

    </div>
    </div>
  );
}
