import votingInfo from "@/data/voting-info.json";

const TYPE_COLORS: Record<string, string> = {
  filing: "bg-[#f7fcf5] border-[#2e5120] text-[#2e5120]",
  registration: "bg-[#f7fcf5] border-[#2e5120] text-[#2e5120]",
  primary: "bg-[#f7fcf5] border-[#2e5120] text-[#2e5120]",
  early_voting: "bg-emerald-50 border-emerald-300 text-emerald-800",
  absentee: "bg-sky-50 border-sky-300 text-sky-800",
  general: "bg-[#E9F5EE] border-[#52B788] text-[#2e5120]",
};

export function DeadlineBanner() {
  const today = new Date();
  const upcoming = (votingInfo.deadlines as Array<{ label: string; date: string; type: string }>)
    .filter((d) => new Date(d.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <h3 className="font-extrabold text-[#0f3501] mb-4 text-2xl">
        Upcoming Deadlines
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {upcoming.map((d) => {
          const colorClass = TYPE_COLORS[d.type] ?? "bg-gray-50 border-gray-300 text-gray-800";
          const date = new Date(d.date + "T12:00:00");
          const formatted = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <div key={d.label} className={`rounded-[5px] border px-3 pb-3 pt-2 ${colorClass}`}>
              <div className="inline-block mb-2 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
                <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                  {d.type.replace(/_/g, " ")}
                </span>
              </div>
              <p className="font-bold" style={{ fontSize: "22px" }}>{formatted}</p>
              <p className="text-sm mt-0.5">{d.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
