"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar } from "@/components/avatar"
import { PartyBadge } from "@/components/party-badge"
import { calculateMatches, UserAnswer, CandidateMatch } from "@/lib/quiz-matcher"
import candidatesData from "@/data/candidates.json"
import questionsData from "@/data/quiz-questions.json"
import issuesData from "@/data/issues.json"

// ---------- types ----------
type Phase = "intro" | "core" | "issue-select" | "deep-dive" | "results"

type SavedQuizResult = {
  savedAt: string
  county: string
  answers: UserAnswer[]
  topMatches: CandidateMatch[]
}

// ---------- constants ----------
const STORAGE_KEY = "ny-voting-guide-quiz-results"
const PREVIOUS_KEY = "ny-voting-guide-quiz-results-previous"

const NY_COUNTIES = [
  "Albany", "Allegany", "Bronx", "Broome", "Cattaraugus", "Cayuga",
  "Chautauqua", "Chemung", "Chenango", "Clinton", "Columbia", "Cortland",
  "Delaware", "Dutchess", "Erie", "Essex", "Franklin", "Fulton", "Genesee",
  "Greene", "Hamilton", "Herkimer", "Jefferson", "Kings", "Lewis", "Livingston",
  "Madison", "Monroe", "Montgomery", "Nassau", "New York", "Niagara", "Oneida",
  "Onondaga", "Ontario", "Orange", "Orleans", "Oswego", "Otsego", "Putnam",
  "Queens", "Rensselaer", "Richmond", "Rockland", "St. Lawrence", "Saratoga",
  "Schenectady", "Schoharie", "Schuyler", "Seneca", "Steuben", "Suffolk",
  "Sullivan", "Tioga", "Tompkins", "Ulster", "Warren", "Washington", "Wayne",
  "Westchester", "Wyoming", "Yates",
]

const ISSUE_ICONS: Record<string, string> = {
  housing: "",
  climate: "",
  economy: "",
  "public-safety": "",
  education: "",
  healthcare: "",
  immigration: "",
  infrastructure: "",
}

// ---------- helpers ----------
type Candidate = {
  id: string
  name: string
  party: string
  race: string
  level: string
  incumbent: boolean
  photo_url: string | null
  [key: string]: unknown
}

const allCandidates = candidatesData as Candidate[]
const allQuestions = questionsData as Array<{
  id: string
  issue_id: string
  issue_label: string
  tier: number
  text: string
  context: string | null
  candidate_positions: Record<string, number | null>
}>

function getCandidateById(id: string): Candidate {
  return allCandidates.find((c) => c.id === id) ?? {
    id,
    name: id,
    party: "Unknown",
    race: "Unknown",
    level: "unknown",
    incumbent: false,
    photo_url: null,
  }
}

function getQuestionLabel(qId: string): string {
  const q = allQuestions.find((q) => q.id === qId)
  return q ? q.text : qId
}

// ---------- component ----------
export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("intro")
  const [county, setCounty] = useState<string>("")
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [deepDiveIssues, setDeepDiveIssues] = useState<Set<string>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [pendingImportance, setPendingImportance] = useState<1 | 2 | 3>(2)
  const [pendingAnswer, setPendingAnswer] = useState<1 | 0 | -1 | null>(null)
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  const [savedResult, setSavedResult] = useState<SavedQuizResult | null>(null)
  const [previousResult, setPreviousResult] = useState<SavedQuizResult | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [showLimitedData, setShowLimitedData] = useState(false)

  // Load saved results from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const current = localStorage.getItem(STORAGE_KEY)
      const previous = localStorage.getItem(PREVIOUS_KEY)
      if (current) setSavedResult(JSON.parse(current))
      if (previous) setPreviousResult(JSON.parse(previous))
    } catch {
      // ignore
    }
  }, [])

  // Auto-save progress when answers change
  useEffect(() => {
    if (typeof window === "undefined" || answers.length === 0) return
    try {
      localStorage.setItem(
        `${STORAGE_KEY}-progress`,
        JSON.stringify({ county, answers })
      )
    } catch {
      // ignore
    }
  }, [answers, county])

  // ---------- question sets ----------
  const coreQuestions = useMemo(
    () => allQuestions.filter((q) => q.tier === 1),
    []
  )

  const deepQuestions = useMemo(
    () =>
      allQuestions.filter(
        (q) => q.tier === 2 && deepDiveIssues.has(q.issue_id)
      ),
    [deepDiveIssues]
  )

  const activeQuestions = useMemo(
    () => (phase === "deep-dive" ? deepQuestions : coreQuestions),
    [phase, coreQuestions, deepQuestions]
  )

  const totalQuestions = activeQuestions.length
  const progress = totalQuestions === 0 ? 0 : (currentIndex / totalQuestions) * 100
  const currentQuestion = activeQuestions[currentIndex]

  // ---------- matches ----------
  const matches = useMemo(() => {
    if (phase !== "results") return []
    return calculateMatches(answers, allCandidates, allQuestions)
  }, [phase, answers])

  // ---------- handlers ----------
  function handleAnswerSelect(value: 1 | 0 | -1) {
    if (value === 0) {
      // Neutral: record and advance immediately
      const newAns: UserAnswer = {
        questionId: currentQuestion.id,
        answer: 0,
        importance: 2,
      }
      setAnswers((prev) => [...prev, newAns])
      advance()
    } else {
      setPendingAnswer(value)
      setPendingImportance(2)
    }
  }

  function handleSkip() {
    const newAns: UserAnswer = {
      questionId: currentQuestion.id,
      answer: null,
      importance: 2,
    }
    setAnswers((prev) => [...prev, newAns])
    advance()
  }

  function handleConfirmAnswer() {
    if (pendingAnswer === null || pendingAnswer === 0) return
    const newAns: UserAnswer = {
      questionId: currentQuestion.id,
      answer: pendingAnswer,
      importance: pendingImportance,
    }
    setAnswers((prev) => [...prev, newAns])
    setPendingAnswer(null)
    advance()
  }

  function advance() {
    const next = currentIndex + 1
    if (next >= totalQuestions) {
      // Done with this phase
      if (phase === "core") {
        setCurrentIndex(0)
        setPendingAnswer(null)
        setPhase("issue-select")
      } else if (phase === "deep-dive") {
        goToResults()
      }
    } else {
      setCurrentIndex(next)
      setPendingAnswer(null)
    }
  }

  function handleBack() {
    if (currentIndex === 0) return
    // Remove last answer
    setAnswers((prev) => prev.slice(0, -1))
    setCurrentIndex((i) => i - 1)
    setPendingAnswer(null)
  }

  function toggleDeepDive(issueId: string) {
    setDeepDiveIssues((prev) => {
      const next = new Set(prev)
      if (next.has(issueId)) next.delete(issueId)
      else next.add(issueId)
      return next
    })
  }

  function startDeepDive() {
    if (deepDiveIssues.size === 0) {
      goToResults()
      return
    }
    setCurrentIndex(0)
    setPendingAnswer(null)
    setPhase("deep-dive")
  }

  function goToResults() {
    setPhase("results")
  }

  function retakeQuiz() {
    setPhase("intro")
    setAnswers([])
    setDeepDiveIssues(new Set())
    setCurrentIndex(0)
    setPendingAnswer(null)
    setExpandedCandidate(null)
    setShowComparison(false)
  }

  function saveResults() {
    if (typeof window === "undefined") return
    try {
      const current = localStorage.getItem(STORAGE_KEY)
      if (current) {
        localStorage.setItem(PREVIOUS_KEY, current)
        setPreviousResult(JSON.parse(current))
      }
      const result: SavedQuizResult = {
        savedAt: new Date().toISOString(),
        county,
        answers,
        topMatches: matches.slice(0, 10),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
      setSavedResult(result)
      alert("Results saved!")
    } catch {
      // ignore
    }
  }

  // ---------- Results helpers ----------
  const answeredCount = answers.filter((a) => a.answer !== null && a.answer !== 0).length
  const issueCount = new Set(
    answers
      .filter((a) => a.answer !== null && a.answer !== 0)
      .map((a) => {
        const q = allQuestions.find((q) => q.id === a.questionId)
        return q?.issue_id ?? ""
      })
      .filter(Boolean)
  ).size

  // Filtered matches — hide limited-data candidates unless toggled on
  const filteredMatches = useMemo(
    () => showLimitedData ? matches : matches.filter((m) => !m.limitedData),
    [matches, showLimitedData]
  )

  // Group matches by race
  const raceMap = useMemo(() => {
    if (phase !== "results") return {}
    const map: Record<string, CandidateMatch[]> = {}
    for (const match of filteredMatches) {
      const c = getCandidateById(match.candidateId)
      if (!map[c.race]) map[c.race] = []
      map[c.race].push(match)
    }
    return map
  }, [filteredMatches, phase])

  const races = useMemo(() => Object.keys(raceMap).sort(), [raceMap])

  // ---------- RENDER ----------

  // INTRO
  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6"></div>
        <h1 className="text-4xl font-extrabold text-[#081f00] mb-3">
          Find Your Candidates
        </h1>
        <p className="text-base text-[#2e5120] mb-8 max-w-xl mx-auto">
          Answer a few questions about the issues you care about.<br />We&apos;ll show you which NY 2026 candidates best align with your views.
        </p>

        {/* County selector */}
        <div className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-5 mb-6 text-left">
          <label className="text-sm font-semibold text-[#1A1A1A] block mb-2">
            Your county{" "}
            <span className="font-normal text-[#6B7280]">
              (optional — helps highlight your specific races)
            </span>
          </label>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your county…" />
            </SelectTrigger>
            <SelectContent>
              {NY_COUNTIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-[#E9F5EE] rounded-none p-4 text-sm text-[#2e5120] mb-8 text-left">
          <span>
            Your answers are never stored on any server. This quiz runs entirely
            in your browser and your results stay on your device.
          </span>
        </div>

        <Button
          onClick={() => setPhase("core")}
          size="lg"
          className="bg-[#081f00] hover:bg-gradient-to-r hover:from-[#98f970] hover:to-[#3fff8e] text-[#f7fcf5] hover:text-[#081f00] font-semibold border-[0.5px] border-white rounded-[3px] px-10 py-4 text-lg transition-colors"
        >
          Start the Quiz
        </Button>
        <p className="text-sm text-[#6B7280] mt-4">
          Takes 3–5 minutes · 16 core questions · Optional deep dives
        </p>
      </div>
    )
  }

  // CORE or DEEP-DIVE question phase
  if (phase === "core" || phase === "deep-dive") {
    if (!currentQuestion) {
      // Edge case: advance
      if (phase === "core") setPhase("issue-select")
      else goToResults()
      return null
    }

    const issueIcon = ISSUE_ICONS[currentQuestion.issue_id] ?? ""

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#6B7280] mb-2">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-[#E0E0E0] rounded-full">
            <div
              className="h-2 bg-[#3fff8e] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {phase === "deep-dive" && (
            <div className="inline-block mt-1 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
              <span className="block bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-3 py-1 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                Deep Dive — {currentQuestion.issue_label}
              </span>
            </div>
          )}
        </div>

        {/* Issue tag */}
        <div className="inline-block mb-4 rounded-full" style={{ background: "linear-gradient(to right, #98f970, #b3ffd4)", padding: "1px" }}>
          <span className="flex items-center gap-1.5 bg-[#2e5120] text-[#f7fcf5] font-semibold uppercase px-3 py-1 rounded-full" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
            {issueIcon} {currentQuestion.issue_label}
          </span>
        </div>

        {/* Question text */}
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-3 leading-snug">
          {currentQuestion.text}
        </h2>

        {/* Context toggle */}
        {currentQuestion.context && (
          <details className="mb-5 text-sm text-[#6B7280]">
            <summary className="cursor-pointer hover:text-[#2e5120] select-none">
               Background context
            </summary>
            <p className="mt-2 pl-5 border-l-2 border-[#2e5120]">
              {currentQuestion.context}
            </p>
          </details>
        )}

        {/* Answer buttons */}
        {pendingAnswer === null && (
          <div className="space-y-3">
            {(
              [
                { value: 1 as const, emoji: "", label: "Agree" },
                { value: 0 as const, emoji: "", label: "Neutral / Not Sure" },
                { value: -1 as const, emoji: "", label: "Disagree" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswerSelect(opt.value)}
                className="w-full text-left flex items-center gap-4 p-4 rounded-none border-2 border-[#E0E0E0] bg-[#f7fcf5] hover:border-[#2e5120] hover:bg-[#F6FBF8] transition-all font-semibold text-[#1A1A1A]"
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-lg">{opt.label}</span>
              </button>
            ))}
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-[#6B7280] hover:text-[#1A1A1A] py-2"
            >
               Skip this question
            </button>
          </div>
        )}

        {/* Importance selector */}
        {pendingAnswer !== null && pendingAnswer !== 0 && (
          <div className="bg-[#F6FBF8] rounded-none border border-[#D1E8DA] p-6">
            <p className="font-bold text-[#2e5120] mb-4">
              {pendingAnswer === 1 ? "" : ""} You {pendingAnswer === 1 ? "agree" : "disagree"}
            </p>
            <p className="font-semibold text-[#1A1A1A] mb-4">
              How important is this issue to you?
            </p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {(
                [
                  { val: 1 as const, label: "Not Very" },
                  { val: 2 as const, label: "Somewhat" },
                  { val: 3 as const, label: "Very Important" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setPendingImportance(opt.val)}
                  className={`py-3 rounded-none border-2 text-sm font-semibold transition-all ${
                    pendingImportance === opt.val
                      ? "border-[#2e5120] bg-[#2e5120] text-white"
                      : "border-[#E0E0E0] bg-[#f7fcf5] text-[#1A1A1A] hover:border-[#2e5120]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button
              onClick={handleConfirmAnswer}
              className="w-full bg-[#2e5120] hover:bg-[#081f00] text-white font-bold py-3 rounded-none"
            >
              Next Question →
            </Button>
          </div>
        )}

        {/* Back button */}
        {currentIndex > 0 && (
          <button
            onClick={handleBack}
            className="mt-6 text-sm text-[#6B7280] hover:text-[#1A1A1A] flex items-center gap-1"
          >
            ← Back
          </button>
        )}
      </div>
    )
  }

  // ISSUE SELECT phase
  if (phase === "issue-select") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-extrabold text-[#2e5120] mb-2">
          Want to go deeper?
        </h2>
        <p className="text-[#6B7280] mb-6">
          You&apos;ve answered the core questions. Select any issues you&apos;d
          like to explore in more detail.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {issuesData.issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => toggleDeepDive(issue.id)}
              className={`text-left p-4 rounded-none border-2 transition-all ${
                deepDiveIssues.has(issue.id)
                  ? "border-[#2e5120] bg-[#E9F5EE]"
                  : "border-[#E0E0E0] bg-[#f7fcf5] hover:border-[#52B788]"
              }`}
            >
              <div className="text-2xl mb-1">{issue.icon}</div>
              <div className="font-bold text-sm text-[#1A1A1A]">
                {issue.label}
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">
                3 more questions
              </div>
              {deepDiveIssues.has(issue.id) && (
                <div className="text-xs text-[#2e5120] font-semibold mt-1">
                   Added
                </div>
              )}
            </button>
          ))}
        </div>
        <Button
          onClick={startDeepDive}
          className="w-full bg-[#2e5120] text-white font-bold py-3 rounded-none mb-3"
        >
          Continue with{" "}
          {deepDiveIssues.size > 0
            ? `${deepDiveIssues.size * 3} more questions`
            : "selected issues"}{" "}
          →
        </Button>
        <button
          onClick={goToResults}
          className="w-full text-center text-sm text-[#6B7280] hover:text-[#1A1A1A]"
        >
          Skip to results
        </button>
      </div>
    )
  }

  // RESULTS phase
  if (phase === "results") {
    const topMatches = filteredMatches.slice(0, 5)

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-[#2e5120] mb-2">
          Your Candidate Matches
        </h1>
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <p className="text-[#6B7280]">
            Based on {answeredCount} answers across {issueCount} issues
          </p>
          <button
            onClick={() => setShowLimitedData((v) => !v)}
            className="text-xs text-[#6B7280] hover:text-[#2e5120] underline flex-shrink-0"
          >
            {showLimitedData
              ? "Hide candidates with limited data"
              : "Show candidates with limited data"}
          </button>
        </div>

        {/* Top 5 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4"> Your Top Matches</h2>
          <div className="space-y-3">
            {topMatches.map((match, i) => {
              const candidate = getCandidateById(match.candidateId)
              return (
                <div
                  key={match.candidateId}
                  className="bg-[#f7fcf5] rounded-none border-2 border-[#D1E8DA] p-5 flex items-center gap-4"
                >
                  <div className="text-2xl font-extrabold text-[#6B7280] w-8">
                    #{i + 1}
                  </div>
                  <Avatar
                    name={candidate.name}
                    photoUrl={candidate.photo_url}
                    size={48}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#1A1A1A]">
                        {candidate.name}
                      </span>
                      <PartyBadge party={candidate.party} small />
                      {candidate.incumbent && (
                        <span className="text-xs bg-[#E9F5EE] text-[#2e5120] rounded-full px-2 py-0.5">
                          Incumbent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280]">{candidate.race}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full">
                        <div
                          className="h-2 rounded-full bg-[#52B788] transition-all"
                          style={{ width: `${match.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-2xl font-extrabold ${
                        match.score >= 70
                          ? "text-[#2e5120]"
                          : match.score >= 50
                          ? "text-[#52B788]"
                          : "text-[#6B7280]"
                      }`}
                    >
                      {match.score}%
                    </div>
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="text-xs text-[#2e5120] hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Breakdown by race */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4"> Breakdown by Race</h2>
          {races.map((race) => {
            const matchesForRace = raceMap[race] ?? []
            return (
              <div key={race} className="mb-6">
                <h3 className="font-bold text-[#2e5120] border-b border-[#E0E0E0] pb-1 mb-3">
                  {race}
                </h3>
                <div className="space-y-2">
                  {matchesForRace.map((match) => {
                    const candidate = getCandidateById(match.candidateId)
                    const isExpanded = expandedCandidate === match.candidateId
                    const aligned = match.alignedQuestions
                    const clashed = match.clashedQuestions
                    const unknown = match.unknownQuestions

                    return (
                      <div
                        key={match.candidateId}
                        className="bg-[#f7fcf5] rounded-none border border-[#E0E0E0] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={candidate.name}
                            photoUrl={candidate.photo_url}
                            size={36}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#1A1A1A]">
                                {candidate.name}
                              </span>
                              <PartyBadge party={candidate.party} small />
                              {match.limitedData && (
                                <span className="text-xs text-[#6B7280]">
                                  (limited data)
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full">
                                <div
                                  className="h-1.5 rounded-full bg-[#52B788]"
                                  style={{ width: `${match.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-[#2e5120] flex-shrink-0">
                                {match.score}%
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setExpandedCandidate(
                                isExpanded ? null : match.candidateId
                              )
                            }
                            className="text-xs text-[#2e5120] hover:underline flex-shrink-0 font-medium"
                          >
                            {isExpanded ? "Hide ▲" : "See why →"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 bg-[#F6FBF8] rounded-none p-4 space-y-3">
                            {aligned.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-emerald-700 mb-1">
                                   Aligned on:
                                </p>
                                {aligned.map((qId) => (
                                  <p
                                    key={qId}
                                    className="text-sm text-[#1A1A1A] ml-3"
                                  >
                                    • {getQuestionLabel(qId)}
                                  </p>
                                ))}
                              </div>
                            )}
                            {clashed.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-rose-700 mb-1">
                                   Clashed on:
                                </p>
                                {clashed.map((qId) => (
                                  <p
                                    key={qId}
                                    className="text-sm text-[#1A1A1A] ml-3"
                                  >
                                    • {getQuestionLabel(qId)}
                                  </p>
                                ))}
                              </div>
                            )}
                            {unknown.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-[#6B7280] mb-1">
                                   No known position on{" "}
                                  {unknown.length} question
                                  {unknown.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            )}
                            <Link
                              href={`/candidates/${match.candidateId}`}
                              className="inline-block text-xs text-[#2e5120] hover:underline font-medium mt-1"
                            >
                              View full profile →
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>

        {/* Actions bar */}
        <div className="bg-[#f7fcf5] border border-[#E0E0E0] rounded-none p-5 flex flex-wrap gap-3">
          <Button
            onClick={retakeQuiz}
            variant="outline"
            className="border-[#2e5120] text-[#2e5120] hover:bg-[#E9F5EE]"
          >
             Retake Quiz
          </Button>
          <Button
            onClick={saveResults}
            className="bg-[#2e5120] hover:bg-[#2D6A4F] text-white"
          >
             Save These Results
          </Button>
          {previousResult && (
            <Button
              onClick={() => setShowComparison(true)}
              variant="outline"
              className="border-[#6B7280] text-[#6B7280]"
            >
               Compare with Previous
            </Button>
          )}
        </div>

        {/* Comparison modal */}
        {showComparison && previousResult && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f7fcf5] rounded-none max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#2e5120]">
                  Quiz Comparison
                </h3>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-[#6B7280] hover:text-[#1A1A1A] text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="text-sm text-[#6B7280] mb-4 flex gap-6">
                <span>
                  <strong>Previous:</strong>{" "}
                  {new Date(previousResult.savedAt).toLocaleDateString()}
                </span>
                <span>
                  <strong>Current:</strong> {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-2">
                {races.map((race) => {
                  const currentTop = (raceMap[race] ?? [])[0]
                  const prevTopForRace = previousResult.topMatches.find(
                    (m) => getCandidateById(m.candidateId).race === race
                  )
                  const changed =
                    currentTop &&
                    prevTopForRace &&
                    Math.abs(currentTop.score - prevTopForRace.score) >= 10

                  return (
                    <div
                      key={race}
                      className={`p-3 rounded-none border ${
                        changed
                          ? "border-amber-300 bg-amber-50"
                          : "border-[#E0E0E0]"
                      }`}
                    >
                      <p className="text-xs font-bold text-[#6B7280] mb-1">
                        {race}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div className="flex-1">
                          <p className="text-[#6B7280] text-xs mb-0.5">
                            Previous
                          </p>
                          {prevTopForRace ? (
                            <p className="font-semibold">
                              {getCandidateById(prevTopForRace.candidateId).name}{" "}
                              <span className="text-[#6B7280]">
                                {prevTopForRace.score}%
                              </span>
                            </p>
                          ) : (
                            <p className="text-[#6B7280]">—</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[#6B7280] text-xs mb-0.5">
                            Current
                          </p>
                          {currentTop ? (
                            <p className="font-semibold">
                              {getCandidateById(currentTop.candidateId).name}{" "}
                              <span className="text-[#2e5120]">
                                {currentTop.score}%
                              </span>
                            </p>
                          ) : (
                            <p className="text-[#6B7280]">—</p>
                          )}
                        </div>
                      </div>
                      {changed && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          Score changed significantly
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              <Button
                onClick={() => setShowComparison(false)}
                className="mt-4 w-full bg-[#2e5120] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
