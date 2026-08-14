"use client";

import { useState } from "react";
import candidatesData from "@/data/candidates.json";
import { PartyBadge } from "@/components/party-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";

const COUNTIES = [
  "Albany", "Allegany", "Bronx", "Broome", "Cattaraugus", "Cayuga",
  "Chautauqua", "Chemung", "Chenango", "Clinton", "Columbia", "Cortland",
  "Delaware", "Dutchess", "Erie", "Essex", "Franklin", "Fulton",
  "Genesee", "Greene", "Hamilton", "Herkimer", "Jefferson", "Kings",
  "Lewis", "Livingston", "Madison", "Monroe", "Montgomery", "Nassau",
  "New York", "Niagara", "Oneida", "Onondaga", "Ontario", "Orange",
  "Orleans", "Oswego", "Otsego", "Putnam", "Queens", "Rensselaer",
  "Richmond", "Rockland", "St. Lawrence", "Saratoga", "Schenectady",
  "Schoharie", "Schuyler", "Seneca", "Steuben", "Suffolk", "Sullivan",
  "Tioga", "Tompkins", "Ulster", "Warren", "Washington", "Wayne",
  "Westchester", "Wyoming", "Yates",
];

const LEVEL_ORDER = ["statewide", "federal", "state_legislature", "local"];
const LEVEL_LABELS: Record<string, string> = {
  statewide: "Statewide Races",
  federal: "Federal Races",
  state_legislature: "State Legislature",
  local: "Local Races",
};
const LEVEL_DESCRIPTIONS: Record<string, string> = {
  statewide: "Governor, Attorney General, Comptroller — all NY voters vote in these races.",
  federal: "U.S. House races for your county's congressional districts.",
  state_legislature: "Your State Senate and Assembly representatives.",
  local: "Local and county races.",
};

function getRacesForCounty(county: string) {
  const all = candidatesData as any[];

  const statewide = all.filter((c) => c.level === "statewide");
  const federal = all.filter((c) => c.level === "federal" && (c.county === county || c.county === null));
  const state_legislature = all.filter((c) => c.level === "state_legislature" && (c.county === county || c.county === null));
  const local = all.filter((c) => c.level === "local" && (c.county === county || c.county === null));

  return { statewide, federal, state_legislature, local };
}

function groupByRace(candidates: any[]) {
  const groups: Record<string, any[]> = {};
  candidates.forEach((c) => {
    if (!groups[c.race]) groups[c.race] = [];
    groups[c.race].push(c);
  });
  return groups;
}

export default function FindMyRacesPage() {
  const [county, setCounty] = useState("");

  const races = county ? getRacesForCounty(county) : null;

  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E9F5EE] rounded-full mb-4">
          <MapPin size={28} className="text-[#2e5120]" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#081f00] mb-2">Find My Races</h1>
        <p className="text-[#2e5120] text-lg max-w-xl mx-auto">
          Select your county to see every 2026 race on your ballot — from Governor to your local assembly district.
        </p>
      </div>

      <div className="max-w-sm mx-auto mb-10">
        <Select value={county} onValueChange={setCounty}>
          <SelectTrigger className="border-2 border-[#2e5120] rounded-none h-12 text-base font-medium text-[#1A1A1A]">
            <SelectValue placeholder="Select your county..." />
          </SelectTrigger>
          <SelectContent>
            {COUNTIES.map((c) => (
              <SelectItem key={c} value={c} className="focus:bg-[#2e5120] focus:text-white">{c} County</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {county && races && (
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#2e5120]">
              Races for <span className="text-[#52B788]">{county} County</span>
            </h2>
          </div>

          {LEVEL_ORDER.map((levelKey) => {
            const candidates = races[levelKey as keyof typeof races];
            if (!candidates || candidates.length === 0) return null;
            const grouped = groupByRace(candidates);
            const raceNames = Object.keys(grouped);
            if (raceNames.length === 0) return null;

            return (
              <section key={levelKey}>
                <div className="bg-[#2e5120] text-white rounded-none px-5 py-3 mb-4">
                  <h3 className="font-bold text-lg">{LEVEL_LABELS[levelKey]}</h3>
                  <p className="text-[#A7F3D0] text-sm">{LEVEL_DESCRIPTIONS[levelKey]}</p>
                </div>
                <div className="space-y-4">
                  {raceNames.map((raceName) => {
                    const raceCandidates = grouped[raceName];
                    return (
                      <div key={raceName} className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5 shadow-sm">
                        <h4 className="font-bold text-[#1A1A1A] text-base mb-3">{raceName}</h4>
                        <div className="space-y-2">
                          {raceCandidates.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <PartyBadge party={c.party} small />
                                <span className="font-medium text-[#1A1A1A] text-sm truncate">{c.name}</span>
                                {c.incumbent && (
                                  <Badge variant="outline" className="text-xs border-[#52B788] text-[#2e5120] flex-shrink-0">
                                    Incumbent
                                  </Badge>
                                )}
                              </div>
                              <Link
                                href={`/candidates/${c.id}`}
                                className="flex items-center gap-1 text-xs text-[#2e5120] hover:text-[#2D6A4F] font-semibold flex-shrink-0 hover:underline"
                              >
                                Profile <ChevronRight size={14} />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!county && (
        <div className="text-center py-10 text-[#6B7280]">
          <p className="text-lg">Select your county above to see your races.</p>
        </div>
      )}
    </div>
    </div>
  );
}
