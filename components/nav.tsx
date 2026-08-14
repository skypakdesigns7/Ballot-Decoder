"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";

const dropdowns = [
  {
    label: "Candidates",
    items: [
      { href: "/candidates", label: "Browse Candidates" },
      { href: "/quiz", label: "Voter Quiz" },
    ],
  },
  {
    label: "Voting",
    items: [
      { href: "/voting-info", label: "Voting Info" },
      { href: "/find-my-races", label: "Find My Races" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/glossary", label: "Glossary" },
      { href: "/ballot-proposals", label: "Ballot Proposals" },
      { href: "/officials", label: "Officials" },
      { href: "/money", label: "Money in Politics" },
    ],
  },
];

const mobileLinks = [
  { href: "/candidates", label: "Browse Candidates" },
  { href: "/quiz", label: "Voter Quiz" },
  { href: "/voting-info", label: "Voting Info" },
  { href: "/find-my-races", label: "Find My Races" },
  { href: "/glossary", label: "Glossary" },
  { href: "/ballot-proposals", label: "Ballot Proposals" },
  { href: "/officials", label: "Officials" },
  { href: "/money", label: "Money in Politics" },
];

function DropdownMenu({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { href: string; label: string }[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = items.some((i) => pathname === i.href);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-none ${
          isActive
            ? "bg-[#386023] text-white"
            : "text-[#b3ffd4] hover:bg-[#98f970] hover:text-[#2e5120]"
        }`}
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg border border-[#E0E0E0] z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[#E9F5EE] text-[#2e5120] font-semibold"
                  : "text-[#1A1A1A] hover:bg-[#cae2bf] hover:text-[#2e5120]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-[#2e5120] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-[#98f970] transition-colors">
            <Image src="/logomark.png" alt="Ballot Decoder" width={24} height={39} className="h-10 w-auto" />
            <span className="leading-none">Ballot<br />Decoder</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-none ${
                pathname === "/"
                  ? "bg-[#386023] text-white"
                  : "text-[#b3ffd4] hover:bg-[#98f970] hover:text-[#2e5120]"
              }`}
            >
              Home
            </Link>
            {dropdowns.map((d) => (
              <DropdownMenu key={d.label} label={d.label} items={d.items} pathname={pathname} />
            ))}
            <Link href="/find-my-races">
              <Button className="ml-3 bg-gradient-to-r from-[#98f970] to-[#3fff8e] hover:from-[#edf9e8] hover:to-[#edf9e8] text-[#081f00] font-semibold border-[0.5px] border-white rounded-[3px]">
                Find My Races
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-none text-[#b3ffd4] hover:bg-[#2D6A4F]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-[#2D6A4F] mt-1 pt-3 flex flex-col gap-1">
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-none text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[#386023] text-white"
                    : "text-[#b3ffd4] hover:bg-[#98f970] hover:text-[#2e5120]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/find-my-races" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full bg-gradient-to-r from-[#98f970] to-[#b3ffd4] hover:from-[#edf9e8] hover:to-[#edf9e8] text-[#2e5120] font-semibold border border-white">
                Find My Races
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
