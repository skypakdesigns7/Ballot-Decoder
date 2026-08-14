import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IssueCard } from "@/components/issue-card";
import { DeadlineBanner } from "@/components/deadline-banner";
import issuesData from "@/data/issues.json";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#edf9e8] border-b border-[#92b286]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8 md:gap-0">
          {/* Left: hero text */}
          <div className="flex-1 pr-0 md:pr-10">
            <div className="inline-block mb-6 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
              <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-3 py-1 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                2026 New York State Elections
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5 text-[#0f3501]">
              <span className="whitespace-nowrap">Know Before You Vote</span>
              <span className="block text-[#0f3501] font-normal">in 2026</span>
            </h1>
            <p className="text-xl text-[#2e5120] mb-1">
              The general election is <strong>November 3, 2026</strong>.
            </p>
            <p className="text-xl text-[#2e5120] mb-3">
              Primaries are <strong>June 23, 2026</strong>.
            </p>
            <p className="text-sm text-[#2e5120]">
              Governor, Attorney General, Comptroller, all 26 U.S. House seats, 63 State Senate seats, and 150 Assembly seats are all on the ballot.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-[#92b286] self-stretch mx-2" />

          {/* Right: upcoming deadlines */}
          <div className="flex-1 pl-0 md:pl-10 flex flex-col justify-start">
            <DeadlineBanner />
          </div>
        </div>
      </section>

      {/* How it Works - full bleed */}
      <section className="bg-[#2e5120] rounded-none py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold mb-2 text-[#f7fcf5]">How to Use This Guide</h2>
          <p className="text-[#edf9e8] mb-8">Four steps to being a more informed New York voter</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Find Your Races",
                desc: "Enter your county to see every race on your ballot — from Governor all the way down to your state assembly district.",
                link: "/find-my-races",
              },
              {
                title: "Research Candidates",
                desc: "Read each candidate's bio, policy positions, and endorsements. Compare two candidates side by side.",
                link: "/candidates",
              },
              {
                title: "Know the Roles",
                desc: "Not sure what a State Comptroller or Assembly Member actually does? Browse plain-English explanations of every elected position in New York.",
                link: "/glossary",
              },
              {
                title: "Register & Vote",
                desc: "Check key deadlines, learn how to register, request an absentee ballot, or find early voting locations.",
                link: "/voting-info",
              },
            ].map((item) => (
              <div key={item.title} className="relative flex flex-col transition-all duration-150 hover:scale-[1.03] hover:shadow-md" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px", borderRadius: "5px" }}>
                <div className="flex-1 bg-[#386023] px-4 py-4" style={{ borderRadius: "5px" }}>
                  <h3 className="font-bold text-base mb-1.5 text-[#f7fcf5]">{item.title}</h3>
                  <p className="text-[#f7fcf5] text-sm leading-relaxed">{item.desc}</p>
                </div>
                <Link href={item.link} className="absolute inset-0" aria-label={item.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Key Issues */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0f3501]">Key Issues</h2>
              <p className="text-[#2e5120] mt-1">Explore where candidates stand on what matters most to New Yorkers</p>
            </div>
            <Link href="/candidates" className="hidden sm:block">
              <Button className="bg-[#081f00] hover:bg-gradient-to-r hover:from-[#98f970] hover:to-[#3fff8e] text-[#f7fcf5] hover:text-[#081f00] font-semibold border-[0.5px] border-white rounded-[3px] transition-colors">
                All Candidates
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {issuesData.issues.map((issue) => (
              <Link key={issue.id} href={`/candidates?issue=${issue.id}`} className="h-full block">
                <IssueCard issue={issue} />
              </Link>
            ))}
          </div>
        </section>

        {/* Glossary */}
      </div>

      {/* Know the Roles + Find Your Candidates - combined full bleed */}
      <section className="bg-[#cae2bf] rounded-none py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 md:gap-0">

          {/* Left: Ballot Proposals */}
          <div className="flex-1 pr-0 md:pr-10 flex flex-col">
            <h2 className="text-2xl font-extrabold mb-3 text-[#0f3501]">Ballot Proposals</h2>
            <p className="text-sm text-[#386023] mb-6 leading-relaxed">
              Beyond candidates, New Yorkers vote directly on proposed laws and constitutional amendments.
              Understand what's on the ballot — what each proposal would change, who supports or opposes it,
              and what a yes or no vote actually means.
            </p>
            <Link href="/ballot-proposals" className="self-start mt-auto">
              <Button size="lg" className="bg-[#081f00] hover:bg-gradient-to-r hover:from-[#98f970] hover:to-[#3fff8e] text-[#f7fcf5] hover:text-[#081f00] font-semibold border-[0.5px] border-white rounded-[3px] px-8 whitespace-nowrap transition-colors">
                Explore Ballot Proposals
              </Button>
            </Link>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-[#92b286] self-stretch mx-2" />

          {/* Right: Find Your Candidates */}
          <div className="flex-1 pl-0 md:pl-10 flex flex-col">
            <h2 className="text-2xl font-extrabold mb-2 text-[#0f3501]">Find Your Candidates</h2>
            <p className="text-sm text-[#386023] max-w-md mb-6">
              Take our 3-minute quiz to discover which 2026 NY candidates best align with your views on housing, climate, public safety, and more.
            </p>
            <Link href="/quiz" className="flex-shrink-0 self-start mt-auto">
              <Button size="lg" className="bg-[#081f00] hover:bg-gradient-to-r hover:from-[#98f970] hover:to-[#3fff8e] text-[#f7fcf5] hover:text-[#081f00] font-semibold border-[0.5px] border-white rounded-[3px] px-8 whitespace-nowrap transition-colors">
                Take the Quiz
              </Button>
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
