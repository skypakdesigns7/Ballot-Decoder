import Image from "next/image";

interface Issue {
  id: string;
  label: string;
  icon: string;
  image_url?: string;
  image_size?: string;
  description: string;
}

interface IssueCardProps {
  issue: Issue;
  selected?: boolean;
  onClick?: () => void;
}

export function IssueCard({ issue, selected, onClick }: IssueCardProps) {
  const hasImage = !!issue.image_url;

  return (
    <button
      onClick={onClick}
      className={`w-full h-full text-left rounded-[5px] border transition-all duration-150 hover:shadow-md hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:ring-offset-2 overflow-hidden flex flex-col ${
        selected ? "border-[#2e5120] shadow-md" : "border-[#2e5120]"
      } ${hasImage ? "bg-[#cae2bf]" : "bg-[#f7fcf5]"}`}
    >
      {hasImage ? (
        <>
          <div className="h-40 flex items-center justify-center px-4 pt-3 pb-1">
            <Image
              src={issue.image_url!}
              alt={issue.label}
              width={746}
              height={1027}
              className="object-contain"
              style={{
                maxWidth: issue.image_size ?? "50%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
              }}
            />
          </div>
          <div className="px-4 pt-2 pb-1">
            <h3 className="font-bold text-[13px] uppercase text-[#081f00] text-center">{issue.label}</h3>
          </div>
          <div className="px-4 pb-4">
            <p className="text-xs text-[#081f00] leading-relaxed line-clamp-3">
              {issue.description}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="h-40 bg-gradient-to-r from-[#081f00] to-[#2e5120] flex items-center px-4">
            <h3 className="font-semibold text-xs uppercase text-[#f7fcf5]">{issue.label}</h3>
          </div>
          <div className="p-4 relative flex-1">
            <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">
              {issue.description}
            </p>
            <span className="absolute bottom-2 right-2 text-[#2e5120] text-xs opacity-50">→</span>
          </div>
        </>
      )}
    </button>
  );
}
