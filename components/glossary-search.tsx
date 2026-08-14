"use client";

import { Search, X } from "lucide-react";

interface GlossarySearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export function GlossarySearch({ value, onChange, resultCount }: GlossarySearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search any position..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-10 py-3.5 text-base border-2 border-[#E0E0E0] rounded-none focus:outline-none focus:border-[#2D6A4F] bg-[#f7fcf5] shadow-sm transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] p-1 rounded-full hover:bg-[#F3F4F6] transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {value.trim() && resultCount !== undefined && (
        <p className="text-sm text-[#6B7280] pl-1">
          Showing <span className="font-semibold text-[#2e5120]">{resultCount}</span> result{resultCount !== 1 ? "s" : ""} for &ldquo;{value}&rdquo;
        </p>
      )}
      {value.trim() && resultCount === 0 && (
        <p className="text-sm text-[#6B7280] pl-1">
          No positions match &ldquo;{value}&rdquo;. Try searching for &ldquo;judge&rdquo;, &ldquo;council&rdquo;, or &ldquo;comptroller&rdquo;.
        </p>
      )}
    </div>
  );
}
