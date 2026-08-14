import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#2e5120] text-[#A7F3D0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-base mb-3">Ballot Decoder</h3>
            <p className="text-xs text-[#74C69D]">
              A nonpartisan civic resource to help New Yorkers<br />understand their elections and elected officials.
            </p>
          </div>
          <div className="flex gap-8 justify-center">
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Quick Links</h3>
              <ul className="space-y-1 text-xs">
                <li><Link href="/find-my-races" className="hover:text-white transition-colors">Find My Races</Link></li>
                <li><Link href="/candidates" className="hover:text-white transition-colors">Candidates</Link></li>
                <li><Link href="/officials" className="hover:text-white transition-colors">Current Officials</Link></li>
                <li><Link href="/voting-info" className="hover:text-white transition-colors">Voting Info</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-3 invisible">Quick Links</h3>
              <ul className="space-y-1 text-xs">
                <li><Link href="/ballot-proposals" className="hover:text-white transition-colors">Ballot Proposals</Link></li>
                <li><Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link></li>
                <li><Link href="/money" className="hover:text-white transition-colors">Money in Politics</Link></li>
                <li><Link href="/quiz" className="hover:text-white transition-colors">Voter Quiz</Link></li>
              </ul>
            </div>
          </div>
          <div className="pl-16">
            <h3 className="text-white font-semibold text-sm mb-3">Official Resources</h3>
            <ul className="space-y-1 text-xs">
              <li><a href="https://elections.ny.gov" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NY Board of Elections</a></li>
              <li><a href="https://elections.ny.gov/registerstatus" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Check Registration</a></li>
              <li><a href="https://elections.ny.gov/pollingplace" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Find Polling Place</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2D6A4F] pt-6 text-[10px] text-[#74C69D] text-center">
          <p>
             This guide is for educational purposes only. Always verify candidate information and deadlines with official sources at{" "}
            <a href="https://elections.ny.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              elections.ny.gov
            </a>.
          </p>
          <p className="mt-1"> 2026 Ballot Decoder. Not affiliated with any political party or government agency.</p>
        </div>
      </div>
    </footer>
  );
}
