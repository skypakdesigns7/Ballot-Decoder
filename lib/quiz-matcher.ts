export type UserAnswer = {
  questionId: string
  answer: 1 | 0 | -1 | null  // 1=Agree, 0=Neutral, -1=Disagree, null=Skipped
  importance: 1 | 2 | 3       // 1=Not important, 2=Somewhat, 3=Very
}

export type CandidateMatch = {
  candidateId: string
  score: number               // 0–100
  alignedQuestions: string[]
  clashedQuestions: string[]
  unknownQuestions: string[]
  agreedCount: number
  disagreedCount: number
  unknownCount: number
  limitedData: boolean        // true if fewer than 5 scoreable questions
}

// Importance weights: spread wide so "very important" answers dominate
const IMPORTANCE_WEIGHT: Record<1 | 2 | 3, number> = {
  1: 1,  // not important
  2: 3,  // somewhat important
  3: 6,  // very important
}

export function calculateMatches(
  answers: UserAnswer[],
  candidates: Array<{ id: string; [key: string]: unknown }>,
  questions: Array<{ id: string; candidate_positions: Record<string, number | null> }>
): CandidateMatch[] {
  // Total answered (non-skipped, non-neutral) — used for coverage penalty
  const totalAnswered = answers.filter(
    (a) => a.answer !== null && a.answer !== 0
  ).length

  return candidates.map((candidate) => {
    let rawScore = 0
    let maxPossible = 0
    let scoreableCount = 0
    const aligned: string[] = []
    const clashed: string[] = []
    const unknown: string[] = []

    for (const ans of answers) {
      if (ans.answer === null || ans.answer === 0) continue

      const question = questions.find((q) => q.id === ans.questionId)
      if (!question) continue

      const candidatePos = question.candidate_positions[candidate.id]

      // null OR 0 (nuanced): no data to score against — skip entirely
      if (candidatePos === null || candidatePos === undefined || candidatePos === 0) {
        unknown.push(ans.questionId)
        continue
      }

      const weight = IMPORTANCE_WEIGHT[ans.importance]
      maxPossible += weight
      scoreableCount++

      if (ans.answer === candidatePos) {
        rawScore += weight
        aligned.push(ans.questionId)
      } else {
        // Opposite signs: direct clash
        rawScore -= weight
        clashed.push(ans.questionId)
      }
    }

    // Base ratio: -1.0 to +1.0
    const baseRatio = maxPossible === 0 ? 0 : rawScore / maxPossible

    // Spread curve: stretches scores away from 50 so differences are visible
    // ratio=+1 → 110 (clamped to 100), ratio=0 → 50, ratio=-1 → -10 (clamped to 0)
    const spreadScore = 50 + baseRatio * 60

    // Coverage factor: pull score toward 50 when candidate has sparse data
    // coverage=1.0 → no adjustment; coverage=0 → score becomes exactly 50
    const coverage = totalAnswered === 0 ? 0 : scoreableCount / totalAnswered
    const coveredScore = 50 + (spreadScore - 50) * coverage

    const finalScore = Math.round(Math.max(0, Math.min(100, coveredScore)))

    return {
      candidateId: candidate.id,
      score: finalScore,
      alignedQuestions: aligned,
      clashedQuestions: clashed,
      unknownQuestions: unknown,
      agreedCount: aligned.length,
      disagreedCount: clashed.length,
      unknownCount: unknown.length,
      limitedData: scoreableCount < 5,
    }
  }).sort((a, b) => b.score - a.score)
}
