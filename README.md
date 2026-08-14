# Ballot Decoder 2026

A nonpartisan voter guide for the 2026 New York State elections — built with Next.js, TypeScript, and Tailwind CSS.

Ballot Decoder helps New York voters understand what's on their ballot: who's running, what current officials have done, how campaigns are funded, and what key election terms mean — all in one place, ahead of the June 23 primary and November 3 general election.

## Features

- **Find My Races** — Look up every race on your ballot by county, from statewide offices down to state legislature and local races.
- **Candidates** — Browse candidate profiles with bios, policy positions, and endorsements; compare two candidates side by side.
- **Officials** — See current officeholders and their record.
- **Ballot Proposals** — Plain-language breakdowns of statewide ballot proposals.
- **Campaign Finance** — Explore campaign contribution and spending data per candidate.
- **Voting Info** — Key dates, deadlines, and how-to-vote details for the 2026 election cycle.
- **Glossary** — Definitions for common election and government terms.
- **Quiz** — A short quiz to help match voters to the issues and candidates most relevant to them.

## Tech Stack

- [Next.js](https://nextjs.org/) 14 (App Router)
- [React](https://react.dev/) 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) primitives (dialog, select, tabs, separator)
- [lucide-react](https://lucide.dev/) icons

All content (candidates, officials, ballot proposals, campaign finance, glossary, quiz questions, voting info) is sourced from static JSON files in `data/`.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint the codebase
```

## Project Structure

```
app/                  Route pages (App Router) — one folder per section
  candidates/[id]/    Individual candidate detail pages
components/           Shared UI components
  ui/                 Base design-system components (button, card, select, ...)
data/                 Static JSON content that powers the site
lib/                  Utilities (e.g. quiz matching logic)
scripts/              One-off scripts for fetching candidate/official photos
public/               Static assets
```

## Disclaimer

Ballot Decoder is an independent, nonpartisan project. It is not affiliated with any campaign, party, or government body.
