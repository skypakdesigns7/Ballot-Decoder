import Link from "next/link";
import { PartyBadge } from "./party-badge";
import { Avatar } from "./avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  race: string;
  level: string;
  county: string | null;
  district: string | null;
  incumbent: boolean;
  key_issues: Array<{ issue: string; stance: string }>;
  bio: string;
  website: string;
  election_year: number;
  photo_url?: string | null;
}

interface CandidateCardProps {
  candidate: Candidate;
  compareMode?: boolean;
  isSelected?: boolean;
  compareDisabled?: boolean;
  onCompareToggle?: (id: string) => void;
}

export function CandidateCard({
  candidate,
  compareMode,
  isSelected,
  compareDisabled,
  onCompareToggle,
}: CandidateCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 rounded-none border-2 ${
        isSelected ? "border-[#52B788] shadow-md" : "border-transparent"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            {compareMode && (
              <input
                type="checkbox"
                checked={isSelected}
                disabled={compareDisabled && !isSelected}
                onChange={() => onCompareToggle?.(candidate.id)}
                className={`w-5 h-5 rounded mt-0.5 ${compareDisabled && !isSelected ? "opacity-30 cursor-not-allowed" : "accent-[#2e5120] cursor-pointer"}`}
                aria-label={`Select ${candidate.name} for comparison`}
              />
            )}
            <Avatar name={candidate.name} photoUrl={candidate.photo_url} size={40} />
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
              {candidate.party}
            </span>
            {candidate.incumbent && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
                Incumbent
              </span>
            )}
          </div>
        </div>

        <Link href={`/candidates/${candidate.id}`} className="block group">
          <h3 className="font-bold text-lg text-[#1A1A1A] group-hover:text-[#2e5120] transition-colors leading-tight">
            {candidate.name}
          </h3>
        </Link>
        <p className="text-sm text-[#6B7280] mt-0.5 mb-3">
          {candidate.race}
          {candidate.district && ` · ${candidate.district}`}
          {candidate.county && !candidate.district && ` · ${candidate.county} County`}
        </p>

        <p className="text-sm text-[#1A1A1A] line-clamp-2 mb-3">{candidate.bio}</p>

        {candidate.key_issues.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {candidate.key_issues.slice(0, 3).map((ki) => (
              <span
                key={ki.issue}
                className="text-xs bg-[#E9F5EE] text-[#2e5120] rounded-full px-2.5 py-0.5 font-medium"
              >
                {ki.issue.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            href={`/candidates/${candidate.id}`}
            className="flex-1 text-center text-sm font-bold text-white bg-[#2e5120] hover:bg-[#081f00] rounded-none py-1.5 transition-colors"
          >
            View Profile
          </Link>
          {candidate.website && (
            <a
              href={candidate.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#6B7280] hover:text-[#2e5120] transition-colors"
              aria-label="Official website"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
