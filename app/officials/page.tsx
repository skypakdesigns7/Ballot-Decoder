"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import officialsData from "@/data/officials.json";
import { OfficialCard } from "@/components/official-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ALL_COUNTIES = [
  "Albany", "Bronx", "Erie", "Kings", "Monroe", "Nassau",
  "New York", "Niagara", "Onondaga", "Oswego", "Queens",
  "Richmond", "Suffolk", "Ulster", "Westchester",
];

const LEVELS = [
  { value: "statewide", label: "Statewide" },
  { value: "federal", label: "Federal" },
  { value: "state_legislature", label: "State Legislature" },
  { value: "local", label: "Local / NYC" },
];

const PARTIES = ["Democrat", "Republican", "Independent"];

export default function OfficialsPage() {
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("all");
  const [level, setLevel] = useState("all");
  const [party, setParty] = useState("all");

  const filtered = useMemo(() => {
    return (officialsData as any[]).filter((o) => {
      if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (county !== "all" && o.county !== county) return false;
      if (level !== "all" && o.level !== level) return false;
      if (party !== "all" && o.party !== party) return false;
      return true;
    });
  }, [search, county, level, party]);

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((o) => {
      const key = o.level;
      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    });
    return groups;
  }, [filtered]);

  const levelOrder = ["statewide", "federal", "state_legislature", "local"];
  const levelLabels: Record<string, string> = {
    statewide: "Statewide Officials",
    federal: "Federal Officials",
    state_legislature: "State Legislature",
    local: "Local Officials",
  };

  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#081f00]">Current Officials</h1>
        <p className="text-[#2e5120] mt-1 text-base">New York&apos;s elected officials currently in office (2026)</p>
        <p className="text-sm text-[#2e5120] mt-2">
          Not sure what these roles do?{" "}
          <Link href="/glossary" className="text-[#2D6A4F] hover:underline font-bold">
            See the Glossary →
          </Link>
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <Input
              placeholder="Search officials..."
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
              <SelectItem value="all">All Counties</SelectItem>
              {ALL_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="border-[#E0E0E0]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={party} onValueChange={setParty}>
            <SelectTrigger className="border-[#E0E0E0]">
              <SelectValue placeholder="All Parties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parties</SelectItem>
              {PARTIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">
          <p className="text-xl font-semibold mb-2">No officials found</p>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {levelOrder.filter((l) => grouped[l]).map((l) => (
            <section key={l}>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 border-b border-[#E0E0E0] pb-2">
                {levelLabels[l]}
                <span className="text-[#6B7280] text-base font-normal ml-2">({grouped[l].length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[l].map((o) => (
                  <OfficialCard key={o.id} official={o} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
