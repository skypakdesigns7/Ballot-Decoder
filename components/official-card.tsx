"use client";

import { useState } from "react";
import { PartyBadge } from "./party-badge";
import { Avatar } from "./avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface Official {
  id: string;
  name: string;
  title: string;
  party: string;
  level: string;
  county: string | null;
  district: string | null;
  since: number;
  term_ends: number;
  bio: string;
  website: string;
  photo_url?: string | null;
}

export function OfficialCard({ official }: { official: Official }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="rounded-none hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-2">
          <Avatar name={official.name} photoUrl={official.photo_url} size={44} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-[#1A1A1A] text-base leading-tight">{official.name}</h3>
              <PartyBadge party={official.party} small />
            </div>
            <p className="text-sm text-[#6B7280] mt-0.5">{official.title}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7280] mb-3">
          {official.district && <span>District: {official.district}</span>}
          {official.county && <span>County: {official.county}</span>}
          <span>Since {official.since}</span>
          <span>Term ends {official.term_ends}</span>
        </div>

        {expanded && (
          <p className="text-sm text-[#1A1A1A] mb-3 leading-relaxed">{official.bio}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-[#2e5120] hover:text-[#2D6A4F] transition-colors"
          >
            {expanded ? (
              <>Less <ChevronUp size={14} /></>
            ) : (
              <>More info <ChevronDown size={14} /></>
            )}
          </button>
          {official.website && (
            <a
              href={official.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#2e5120] transition-colors"
            >
              Website <ExternalLink size={12} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
