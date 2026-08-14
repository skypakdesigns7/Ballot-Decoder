import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PARTY_COLORS: Record<string, string> = {
  Democrat: "bg-[#0D9488] text-white",
  Republican: "bg-[#7C3AED] text-white",
  Independent: "bg-[#6B7280] text-white",
  Green: "bg-[#16A34A] text-white",
  "Working Families": "bg-[#D97706] text-white",
  Conservative: "bg-[#92400E] text-white",
  Libertarian: "bg-[#CA8A04] text-white",
};

export const PARTY_BORDER_COLORS: Record<string, string> = {
  Democrat: "border-[#0D9488]",
  Republican: "border-[#7C3AED]",
  Independent: "border-[#6B7280]",
  Green: "border-[#16A34A]",
  "Working Families": "border-[#D97706]",
  Conservative: "border-[#92400E]",
  Libertarian: "border-[#CA8A04]",
};

export function getPartyColor(party: string): string {
  return PARTY_COLORS[party] ?? "bg-[#6B7280] text-white";
}

export function getPartyBorderColor(party: string): string {
  return PARTY_BORDER_COLORS[party] ?? "border-[#6B7280]";
}
