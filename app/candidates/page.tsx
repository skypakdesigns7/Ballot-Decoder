"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import candidatesData from "@/data/candidates.json";
import { CandidateCard } from "@/components/candidate-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GitCompare, Search, X } from "lucide-react";
import Link from "next/link";

const ALL_COUNTIES = [
  "Albany", "Bronx", "Erie", "Kings", "Monroe", "Nassau",
  "New York", "Onondaga", "Queens", "Richmond", "Suffolk",
  "Ulster", "Westchester", "Dutchess", "Niagara", "Oswego",
];

const ALL_PARTIES = ["Democrat", "Republican", "Libertarian", "Working Families", "Independent", "Conservative", "Green"];

const LEVELS = [
  { value: "statewide", label: "Statewide" },
  { value: "federal", label: "Federal (U.S. House/Senate)" },
  { value: "state_legislature", label: "State Legislature" },
  { value: "local", label: "Local / NYC" },
];

function CandidatesContent() {
  const searchParams = useSearchParams();
  const initIssue = searchParams.get("issue") ?? "";

  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("all");
  const [level, setLevel] = useState("all");
  const [party, setParty] = useState("all");
  const [issue, setIssue] = useState(initIssue);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const filtered = useMemo(() => {
    return (candidatesData as any[]).filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.race.toLowerCase().includes(search.toLowerCase())) return false;
      if (county !== "all" && c.county !== county) return false;
      if (level !== "all" && c.level !== level) return false;
      if (party !== "all" && c.party !== party) return false;
      if (issue && !c.key_issues.some((ki: any) => ki.issue === issue)) return false;
      return true;
    });
  }, [search, county, level, party, issue]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const clearFilters = () => {
    setSearch(""); setCounty("all"); setLevel("all"); setParty("all"); setIssue("");
  };

  const hasFilters = search || county !== "all" || level !== "all" || party !== "all" || issue;

  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#081f00]">2026 Candidates</h1>
        <p className="text-[#2e5120] mt-1">{filtered.length} candidates found</p>
        <p className="text-sm text-[#2e5120] mt-2">
          Not sure what these positions are?{" "}
          <Link href="/glossary" className="text-[#2D6A4F] hover:underline font-bold">
            See the Glossary →
          </Link>
        </p>
        <p className="text-sm text-[#2e5120] mt-0.5">
          Follow the money.{" "}
          <Link href="/money" className="text-[#2D6A4F] hover:underline font-bold">
            Money in Politics →
          </Link>
        </p>
        <Button
          onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
          className="mt-6 bg-[#081f00] hover:bg-gradient-to-r hover:from-[#98f970] hover:to-[#3fff8e] text-[#f7fcf5] hover:text-[#081f00] font-semibold border-[0.5px] border-white rounded-[3px] transition-colors"
        >
          <GitCompare size={16} className="mr-2" />
          {compareMode ? "Cancel Compare" : "Compare Candidates"}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <Input
              placeholder="Search by name or race..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-[#E0E0E0]"
            />
          </div>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="border-[#E0E0E0]">
              <SelectValue placeholder="All Counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="focus:bg-[#2e5120] focus:text-white">All Counties</SelectItem>
              {ALL_COUNTIES.map((c) => <SelectItem key={c} value={c} className="focus:bg-[#2e5120] focus:text-white">{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="border-[#E0E0E0]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="focus:bg-[#2e5120] focus:text-white">All Levels</SelectItem>
              {LEVELS.map((l) => <SelectItem key={l.value} value={l.value} className="focus:bg-[#2e5120] focus:text-white">{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={party} onValueChange={setParty}>
            <SelectTrigger className="border-[#E0E0E0]">
              <SelectValue placeholder="All Parties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="focus:bg-[#2e5120] focus:text-white">All Parties</SelectItem>
              {ALL_PARTIES.map((p) => <SelectItem key={p} value={p} className="focus:bg-[#2e5120] focus:text-white">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <div className="mt-3 flex items-center gap-2">
            {issue && (
              <span className="text-xs bg-[#E9F5EE] text-[#2e5120] rounded-full px-2.5 py-1 font-medium flex items-center gap-1">
                Issue: {issue.replace(/-/g, " ")}
                <button onClick={() => setIssue("")}><X size={12} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-[#6B7280] hover:text-[#1A1A1A] underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Compare banner */}
      {compareMode && compareIds.length === 2 && (
        <div className="bg-[#2e5120] text-white rounded-none p-4 mb-6 flex items-center justify-between">
          <p className="font-semibold">2 candidates selected</p>
          <Link href={`/compare?a=${compareIds[0]}&b=${compareIds[1]}`}>
            <Button className="bg-[#081f00] hover:bg-gradient-to-r hover:from-[#98f970] hover:to-[#3fff8e] text-[#f7fcf5] hover:text-[#081f00] font-semibold border-[0.5px] border-white rounded-[3px] transition-colors">
              Compare Side by Side →
            </Button>
          </Link>
        </div>
      )}
      {compareMode && compareIds.length < 2 && (
        <p className="text-[#6B7280] text-sm mb-6">
          Select {2 - compareIds.length} more candidate{compareIds.length === 0 ? "s" : ""} to compare.
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">
          <p className="text-xl font-semibold mb-2">No candidates found</p>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c as any}
              compareMode={compareMode}
              isSelected={compareIds.includes(c.id)}
              compareDisabled={compareIds.length === 2}
              onCompareToggle={toggleCompare}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-[#6B7280]">Loading candidates...</div>}>
      <CandidatesContent />
    </Suspense>
  );
}
