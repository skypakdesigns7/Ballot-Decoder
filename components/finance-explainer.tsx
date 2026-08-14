export function FinanceExplainer() {
  const sections = [
    {
      title: "What is a PAC?",
      body: `A Political Action Committee (PAC) is an organization that raises and spends money to influence elections. Traditional PACs can contribute directly to candidates but are subject to strict contribution limits — currently $5,000 per candidate per election under federal law. Super PACs, created after the 2010 Citizens United Supreme Court ruling, can raise unlimited sums from corporations, unions, and individuals, but cannot donate directly to or coordinate with candidates; instead they spend independently on advertising and outreach. The key difference: a traditional PAC's influence is limited by caps on direct giving, while a Super PAC's influence is theoretically unlimited as long as it operates independently.`,
    },
    {
      title: "What is dark money?",
      body: `Dark money refers to political spending by nonprofit organizations — typically 501(c)(4) "social welfare" groups — that are not required by law to disclose the identities of their donors. These organizations can spend on elections as long as political activity is not their "primary purpose," a loosely defined standard. Because donors remain hidden, voters cannot know which individuals or corporations are ultimately funding political messages. Dark money is used by organizations across the political spectrum; it is a structural feature of current campaign finance law, not a practice unique to any party or ideology. Where dark money support is documented on this page, it means a 501(c)(4) organization has made independent expenditures on a candidate's behalf without disclosing its funding sources.`,
    },
    {
      title: "New York's Public Financing Program",
      body: `New York State enacted a small-donor public matching program that took effect for the 2024 election cycle. Participating candidates receive public matching funds for small donations — contributions of $250 or less from New York State residents are matched at a ratio of up to 6-to-1, meaning a $100 donation can generate an additional $600 in public funds. In exchange, candidates must accept lower contribution limits than the standard state limits. The program is designed to amplify the voices of small donors and reduce dependence on large contributions from wealthy individuals and organizations. Participation is voluntary, and candidates in statewide races (Governor, Attorney General, Comptroller) and state legislative races are eligible. Federal candidates are not eligible for this state program.`,
    },
    {
      title: "How to read campaign finance data",
      body: `Campaign finance data shows where candidates get their money — but correlation between funding sources and policy positions does not imply causation or corruption. A candidate who receives real estate donations may or may not support real estate-friendly policies; many other factors drive legislative decisions. What finance data can reveal: who has invested in a candidate's political future, whether a candidate relies broadly on small donors or narrowly on large ones, and whether outside groups with undisclosed funding are independently active in a race. When reviewing this data, look at the overall funding picture, not just individual donors. Always verify figures at the original source — FEC.gov for federal candidates, the NY Board of Elections for state candidates — as this guide reflects a snapshot in time and filings are updated continuously.`,
    },
  ];

  return (
    <section className="bg-[#f7fcf5] border border-[#E0E0E0] p-8 mt-12">
      <h2 className="text-2xl font-extrabold text-[#2e5120] mb-6">
        Understanding Campaign Finance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h3 className="font-bold text-[#1A1A1A] mb-2 text-base">{s.title}</h3>
            <p className="text-sm text-[#374151] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
