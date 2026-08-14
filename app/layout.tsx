import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const figtree = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ballot Decoder 2026 | Know Before You Vote",
  description:
    "A nonpartisan guide to the 2026 New York State elections. Find candidates, current officials, voting deadlines, and your local races.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${figtree.className} min-h-screen flex flex-col bg-[#edf9e8]`}>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
