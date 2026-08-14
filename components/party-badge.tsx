import { getPartyColor } from "@/lib/utils";

interface PartyBadgeProps {
  party: string;
  small?: boolean;
}

export function PartyBadge({ party, small = false }: PartyBadgeProps) {
  const colorClass = getPartyColor(party);
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      {party}
    </span>
  );
}
