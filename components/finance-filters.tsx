"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export interface FinanceFilterState {
  search: string;
  level: string;
  party: string;
  flag: string;
  sort: string;
}

interface Props {
  filters: FinanceFilterState;
  onChange: (f: FinanceFilterState) => void;
}

const LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "federal", label: "Federal" },
  { value: "statewide", label: "Statewide" },
  { value: "state_legislature", label: "State Legislature" },
  { value: "local", label: "Local" },
];

const PARTIES = [
  { value: "all", label: "All Parties" },
  { value: "Democrat", label: "Democrat" },
  { value: "Republican", label: "Republican" },
  { value: "Libertarian", label: "Libertarian" },
  { value: "Working Families", label: "Working Families" },
  { value: "Independent", label: "Independent" },
  { value: "Conservative", label: "Conservative" },
  { value: "Green", label: "Green" },
];

const FLAGS = [
  { value: "all", label: "All Candidates" },
  { value: "dark_money", label: "Dark Money Recipients" },
  { value: "self_funded", label: "Self-Funded" },
  { value: "public_financing", label: "Public Financing Participants" },
];

const SORTS = [
  { value: "total_raised_desc", label: "Total Raised (High → Low)" },
  { value: "small_donors_desc", label: "Most Small Donors" },
  { value: "pac_desc", label: "Most PAC Funding" },
  { value: "alpha", label: "Alphabetical" },
];

export function FinanceFilters({ filters, onChange }: Props) {
  const set = (key: keyof FinanceFilterState) => (val: string) =>
    onChange({ ...filters, [key]: val });

  return (
    <div className="bg-[#f7fcf5] border border-[#E0E0E0] p-5 mb-8 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="relative xl:col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <Input
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(e) => set("search")(e.target.value)}
            className="pl-9 border-[#E0E0E0]"
          />
        </div>

        <Select value={filters.level} onValueChange={set("level")}>
          <SelectTrigger className="border-[#E0E0E0]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.party} onValueChange={set("party")}>
          <SelectTrigger className="border-[#E0E0E0]">
            <SelectValue placeholder="All Parties" />
          </SelectTrigger>
          <SelectContent>
            {PARTIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.flag} onValueChange={set("flag")}>
          <SelectTrigger className="border-[#E0E0E0]">
            <SelectValue placeholder="All Candidates" />
          </SelectTrigger>
          <SelectContent>
            {FLAGS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={set("sort")}>
          <SelectTrigger className="border-[#E0E0E0]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
