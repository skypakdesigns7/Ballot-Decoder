import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import votingInfo from "@/data/voting-info.json";
import { ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";

export const metadata = {
  title: "Voting Info | Ballot Decoder 2026",
  description: "Registration deadlines, early voting, absentee ballots, and ID requirements for the 2026 New York elections.",
};

export default function VotingInfoPage() {
  return (
    <div className="min-h-screen bg-[#edf9e8]">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#081f00] mb-2">Voting in New York 2026</h1>
        <p className="text-[#2e5120] text-base">Everything you need to register, vote early, or vote absentee.</p>
      </div>

      <Tabs defaultValue="registration" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-[#2e5120] p-1 rounded-none">
          {["registration", "primary", "general", "early-voting", "absentee", "id"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none data-[state=active]:bg-[#2e5120] data-[state=active]:text-white text-sm font-medium text-[#b3ffd4]"
            >
              {tab === "registration" && "Registration"}
              {tab === "primary" && "Primary"}
              {tab === "general" && "General Election"}
              {tab === "early-voting" && "Early Voting"}
              {tab === "absentee" && "Absentee"}
              {tab === "id" && "ID Requirements"}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="registration" className="space-y-5">
          {/* First-time voter callout */}
          <div className="bg-[#E9F5EE] border-2 border-[#52B788] rounded-none p-6">
            <h2 className="text-xl font-bold text-[#2e5120] mb-4 flex items-center gap-2">
              <CheckCircle size={22} /> First-Time Voter? Start Here.
            </h2>
            <ol className="space-y-3">
              {[
                "Confirm you're eligible: U.S. citizen, 18 by Election Day, NY resident 30+ days, not incarcerated for a felony.",
                "Register online at elections.ny.gov, by mail, or in person — deadline is 10 days before the election.",
                "Look up your polling place at elections.ny.gov/pollingplace.",
                "Show up! Bring ID if it's your first time voting after registering by mail.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2e5120] text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[#1A1A1A] text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5">
              <h3 className="font-bold text-[#2e5120] mb-3">Eligibility Requirements</h3>
              <ul className="space-y-2">
                {votingInfo.registration.eligibility.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="text-[#52B788] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5">
              <h3 className="font-bold text-[#2e5120] mb-3">How to Register</h3>
              <ul className="space-y-3">
                {votingInfo.registration.how_to_register.map((method) => (
                  <li key={method.method} className="text-sm">
                    <div className="font-semibold text-[#1A1A1A]">{method.method}</div>
                    <div className="text-[#6B7280]">{method.description}</div>
                    {method.url && (
                      <a href={method.url} target="_blank" rel="noopener noreferrer" className="text-[#2e5120] underline text-xs hover:no-underline">
                        Register now →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {votingInfo.registration.same_day_registration && (
            <div className="bg-amber-50 border border-amber-300 rounded-none p-4 flex gap-3">
              <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Same-Day Registration Available</p>
                <p className="text-sm text-amber-700">{votingInfo.registration.same_day_note}</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="primary" className="space-y-4">
          <div className="bg-[#2e5120] text-white rounded-none p-6">
            <div className="inline-block mb-1 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
              <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-3 py-1 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>Primary Election</span>
            </div>
            <p className="text-white text-4xl font-extrabold mt-3">{votingInfo.primary.date}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Register Online/Mail By", date: votingInfo.primary.registration_deadline_online },
              { label: "Register In Person By", date: votingInfo.primary.registration_deadline_in_person },
              { label: "Major Party Filing Deadline", date: votingInfo.filing_deadlines.major_parties },
            ].map((item) => (
              <div key={item.label} className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-4 text-center">
                <div className="text-[#6B7280] text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</div>
                <div className="text-xl font-bold text-[#2e5120]">{item.date}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="bg-[#2e5120] text-white rounded-none p-6">
            <div className="inline-block mb-1 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
              <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-3 py-1 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>General Election</span>
            </div>
            <p className="text-white text-4xl font-extrabold mt-3">{votingInfo.general.date}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Register Online By", date: votingInfo.general.registration_deadline_online },
              { label: "Register In Person By", date: votingInfo.general.registration_deadline_in_person },
              { label: "Register By Mail By", date: votingInfo.general.registration_deadline_mail },
            ].map((item) => (
              <div key={item.label} className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-4 text-center">
                <div className="text-[#6B7280] text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</div>
                <div className="text-xl font-bold text-[#2e5120]">{item.date}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="early-voting" className="space-y-4">
          <div className="bg-[#2e5120] text-white rounded-none p-6">
            <div className="inline-block mb-1 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
              <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-3 py-1 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>Early Voting (General)</span>
            </div>
            <p className="text-white text-4xl font-extrabold mt-3">{votingInfo.early_voting.general_dates}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5">
              <h3 className="font-bold text-[#2e5120] mb-2">Hours</h3>
              <p className="text-sm text-[#1A1A1A]">{votingInfo.early_voting.hours}</p>
            </div>
            <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5">
              <h3 className="font-bold text-[#2e5120] mb-2">Find Your Early Voting Site</h3>
              <p className="text-sm text-[#1A1A1A]">{votingInfo.early_voting.how_to_find_site}</p>
              <a href="https://elections.ny.gov" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-[#2e5120] underline hover:no-underline">
                elections.ny.gov <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="absentee" className="space-y-4">
          <div className="bg-[#2e5120] text-white rounded-none p-6">
            <div className="inline-block mb-1 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
              <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-3 py-1 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>Absentee Voting</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[#3fff8e] text-sm font-semibold">Request Deadline</p>
                <p className="text-white font-bold text-[23px]">{votingInfo.absentee.request_deadline}</p>
              </div>
              <div>
                <p className="text-[#3fff8e] text-sm font-semibold">Return Deadline</p>
                <p className="text-white font-bold text-[23px]">{votingInfo.absentee.return_deadline}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5">
            <h3 className="font-bold text-[#2e5120] mb-3">Eligible Reasons to Vote Absentee</h3>
            <ul className="space-y-2">
              {votingInfo.absentee.eligibility_reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm">
                  <CheckCircle size={16} className="text-[#52B788] mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
          <a
            href="https://elections.ny.gov/applyabsentee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#2e5120] text-white rounded-none px-5 py-3 font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            Apply for Absentee Ballot <ExternalLink size={16} />
          </a>
        </TabsContent>

        <TabsContent value="id" className="space-y-4">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-none p-5 flex gap-3">
            <AlertCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-lg">{votingInfo.id_requirements.note}</p>
              <p className="text-amber-700 text-sm mt-1">{votingInfo.id_requirements.first_time_note}</p>
            </div>
          </div>
          <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5">
            <h3 className="font-bold text-[#2e5120] mb-3">Acceptable Forms of ID</h3>
            <ul className="space-y-2">
              {votingInfo.id_requirements.acceptable_id.map((id) => (
                <li key={id} className="flex items-start gap-2 text-sm">
                  <CheckCircle size={16} className="text-[#52B788] mt-0.5 flex-shrink-0" />
                  <span>{id}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resources */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Official Resources</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {votingInfo.resources.map((r) => (
            <a
              key={r.label}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-[#f7fcf5] border border-[#E0E0E0] rounded-none p-4 hover:border-[#52B788] hover:shadow-sm transition-all group"
            >
              <span className="font-medium text-sm text-[#1A1A1A] group-hover:text-[#2e5120]">{r.label}</span>
              <ExternalLink size={14} className="text-[#6B7280] group-hover:text-[#2e5120] flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
