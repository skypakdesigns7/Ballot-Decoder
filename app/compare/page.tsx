"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import candidatesData from "@/data/candidates.json";
import { PartyBadge } from "@/components/party-badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/avatar";

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

function CompareContent() {
  const searchParams = useSearchParams();
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  const candidateA = (candidatesData as any[]).find((c) => c.id === idA);
  const candidateB = (candidatesData as any[]).find((c) => c.id === idB);

  if (!candidateA || !candidateB) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-[#081f00] mb-4">Select Candidates to Compare</h1>
        <p className="text-[#2e5120] mb-6">
          Go to the <Link href="/candidates" className="text-[#2e5120] underline">Candidates page</Link>, enable Compare mode, and select two candidates.
        </p>
      </div>
    );
  }

  const issuesA = new Set(candidateA.key_issues.map((ki: any) => ki.issue));
  const issuesB = new Set(candidateB.key_issues.map((ki: any) => ki.issue));
  const allIssues = Array.from(new Set([...Array.from(issuesA), ...Array.from(issuesB)])) as string[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/candidates"
        className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#2e5120] text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Candidates
      </Link>

      <h1 className="text-3xl font-extrabold text-[#081f00] mb-6">Candidate Comparison</h1>

      {/* Header row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[candidateA, candidateB].map((c) => (
          <div key={c.id} className="relative bg-gradient-to-br from-[#081f00] to-[#2e5120] text-white rounded-none px-5 pt-5 pb-3">
            <div className="absolute top-3 left-4 flex items-center gap-1.5">
              <span className="font-semibold text-[#f7fcf5]" style={{ fontSize: "20px", letterSpacing: "0.05em" }}>{c.race}</span>
              {c.incumbent && (
                <span className="inline-flex items-center rounded-full px-3 py-1 font-semibold uppercase bg-[#F3F4F6] text-[#6B7280]" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                  Incumbent
                </span>
              )}
            </div>
            <div className="mt-8 mb-4">
              <Avatar name={c.name} photoUrl={c.photo_url} size={73} />
            </div>
            <h2 className="text-2xl font-extrabold mt-3">{c.name}</h2>
            <p className="text-sm text-[#3fff8e] mt-0.5">{c.party}</p>
          </div>
        ))}
      </div>

      {/* Issues comparison */}
      <div className="space-y-4">
        {allIssues.map((issueId) => {
          const stanceA = candidateA.key_issues.find((ki: any) => ki.issue === issueId)?.stance;
          const stanceB = candidateB.key_issues.find((ki: any) => ki.issue === issueId)?.stance;

          return (
            <div key={issueId}>
              <h3 className="font-bold text-[#2e5120] text-lg mb-3">
                {ISSUE_LABELS[issueId] ?? issueId}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-none border-l-4 border-l-[#081f00]">
                  <CardContent className="p-4">
                    {stanceA ? (
                      <p className="text-sm text-[#1A1A1A] leading-relaxed">{stanceA}</p>
                    ) : (
                      <p className="text-sm text-[#6B7280] italic">Position not available</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="rounded-none border-l-4 border-l-[#386023]">
                  <CardContent className="p-4">
                    {stanceB ? (
                      <p className="text-sm text-[#1A1A1A] leading-relaxed">{stanceB}</p>
                    ) : (
                      <p className="text-sm text-[#6B7280] italic">Position not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#edf9e8]">
      <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-10">Loading comparison...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
