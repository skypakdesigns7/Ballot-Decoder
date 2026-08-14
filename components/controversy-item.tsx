import { cn } from "@/lib/utils";

export interface Controversy {
  id: string;
  title: string;
  date: string;
  description: string;
  source_name: string;
  source_url: string;
  status: "alleged" | "investigated" | "resolved" | "ongoing";
  candidate_response: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  alleged: "bg-[#FEF3C7] text-[#92400E]",
  investigated: "bg-[#EDE9FE] text-[#5B21B6]",
  ongoing: "bg-[#FEF3C7] text-[#92400E]",
  resolved: "bg-[#F3F4F6] text-[#374151]",
};

const STATUS_LABELS: Record<string, string> = {
  alleged: "Alleged",
  investigated: "Investigated",
  ongoing: "Ongoing",
  resolved: "Resolved",
};

interface Props {
  controversy: Controversy;
}

export function ControversyItem({ controversy }: Props) {
  return (
    <div className="border-l-2 border-[#FEF3C7] pl-4 py-1">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="font-semibold text-sm text-[#1A1A1A]">{controversy.title}</span>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            STATUS_STYLES[controversy.status]
          )}
        >
          {STATUS_LABELS[controversy.status]}
        </span>
      </div>
      <p className="text-xs text-[#6B7280] mb-1">{controversy.date}</p>
      <p className="text-sm text-[#1A1A1A] leading-relaxed mb-2">{controversy.description}</p>
      {controversy.candidate_response && (
        <p className="text-sm text-[#6B7280] italic mb-2">
          Candidate responded: &ldquo;{controversy.candidate_response}&rdquo;
        </p>
      )}
      <a
        href={controversy.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#2D6A4F] hover:underline"
      >
        Source: {controversy.source_name} →
      </a>
    </div>
  );
}
