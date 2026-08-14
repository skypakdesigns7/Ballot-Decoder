import { notFound } from "next/navigation";
import candidatesData from "@/data/candidates.json";
import financeData from "@/data/campaign-finance.json";
import { PartyBadge } from "@/components/party-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink, ArrowLeft, GitCompare, Award } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { FinanceSummaryWidget } from "@/components/finance-summary-widget";
import type { FinanceEntry } from "@/components/finance-card";

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  return (candidatesData as any[]).map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const candidate = (candidatesData as any[]).find((c) => c.id === params.id);
  if (!candidate) return { title: "Candidate Not Found" };
  return {
    title: `${candidate.name} | Ballot Decoder 2026`,
    description: candidate.bio,
  };
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const ISSUE_LABELS: Record<string, string> = {
  housing: " Housing & Rent",
  climate: " Climate & Energy",
  economy: " Economy & Jobs",
  "public-safety": " Public Safety & Crime",
  education: " Education",
  healthcare: " Healthcare",
  immigration: " Immigration",
  infrastructure: " Infrastructure & Transit",
};

export default function CandidateDetailPage({ params }: PageProps) {
  const candidate = (candidatesData as any[]).find((c) => c.id === params.id);
  if (!candidate) notFound();

  const financeEntry =
    (financeData as FinanceEntry[]).find((e) => e.candidate_id === params.id) ?? null;

  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/candidates"
        className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#2e5120] text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Candidates
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#2e5120] to-[#2D6A4F] text-white rounded-none p-7 mb-7">
        <div className="flex items-start gap-5">
          <Avatar name={candidate.name} photoUrl={candidate.photo_url} size={72} />
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-[#F3F4F6] text-[#6B7280]">{candidate.party}</span>
              {candidate.incumbent && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-[#F3F4F6] text-[#6B7280]">
                  Incumbent
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{candidate.name}</h1>
            <p className="text-[#A7F3D0] mt-1 text-lg">{candidate.race}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#74C69D]">
              {candidate.district && <span>District: {candidate.district}</span>}
              {candidate.county && <span>County: {candidate.county}</span>}
              {candidate.general_date && <span>General: {formatDate(candidate.general_date)}</span>}
              {candidate.primary_date && <span>Primary: {formatDate(candidate.primary_date)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <Card className="mb-6 rounded-none">
        <CardContent className="p-6">
          <h2 className="font-bold text-[#2e5120] mb-2 text-lg">About</h2>
          <p className="text-[#1A1A1A] leading-relaxed">{candidate.bio}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            {candidate.website && (
              <a
                href={candidate.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#2e5120] text-white rounded-none px-4 py-2 text-sm font-medium hover:bg-[#2D6A4F] transition-colors"
              >
                Official Website <ExternalLink size={14} />
              </a>
            )}
            <Link href={`/compare?a=${candidate.id}`}>
              <Button variant="outline" size="sm" className="border-[#2e5120] text-[#2e5120] hover:bg-[#E9F5EE]">
                <GitCompare size={14} className="mr-1.5" /> Compare with Another
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Key Positions */}
      {candidate.key_issues.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Policy Positions</h2>
          <div className="space-y-3">
            {candidate.key_issues.map((ki: any) => (
              <Card key={ki.issue} className="rounded-none hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <h3 className="font-bold text-[#2e5120] mb-2">
                    {ISSUE_LABELS[ki.issue] ?? ki.issue}
                  </h3>
                  <p className="text-[#1A1A1A] text-sm leading-relaxed">{ki.stance}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Funding */}
      <div className="mb-6">
        <FinanceSummaryWidget entry={financeEntry} candidateId={candidate.id} />
      </div>

      {/* Endorsements */}
      {candidate.endorsements.length > 0 && (
        <Card className="rounded-none">
          <CardContent className="p-6">
            <h2 className="font-bold text-[#2e5120] mb-3 flex items-center gap-2">
              <Award size={18} /> Endorsements
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.endorsements.map((e: string) => (
                <span key={e} className="text-sm bg-[#E9F5EE] text-[#2e5120] rounded-full px-3 py-1">
                  {e}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  );
}
