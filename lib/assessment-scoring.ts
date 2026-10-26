// SERVER ONLY. Holds the Q1-Q20 answer keys and the objective scorer.
// Never import this module from a client component ("use client") or from any
// code path that ends up in a browser bundle. Only route handlers under
// app/api/** may import it.

import {
  MARKS_PER_OBJECTIVE_QUESTION,
  OBJECTIVE_ASSESSMENT_VERSION,
  OBJECTIVE_QUESTION_IDS,
  type AnswerLetter,
  type ObjectiveAssessmentVersion,
  type ObjectiveQuestionId,
} from "@/lib/assessment";

type AnswerKey = Record<ObjectiveQuestionId, AnswerLetter>;

/**
 * One key per assessment version. A version's key is FROZEN once submissions
 * exist against it: changing it would silently re-grade historical rows in the
 * admin breakdown. To change the questions, add a new version instead.
 */
const ANSWER_KEYS: Record<ObjectiveAssessmentVersion, AnswerKey> = {
  // September 2026 - AI literacy questions. Do not edit.
  objective_v1: {
    q1: "B",
    q2: "C",
    q3: "B",
    q4: "B",
    q5: "B",
    q6: "C",
    q7: "B",
    q8: "B",
    q9: "A",
    q10: "A",
    q11: "A",
    q12: "B",
    q13: "B",
    q14: "B",
    q15: "C",
    q16: "B",
    q17: "C",
    q18: "B",
    q19: "C",
    q20: "C",
  },
  // October 2026 - applied judgment + current AI capability awareness.
  objective_v2: {
    q1: "C",
    q2: "B",
    q3: "D",
    q4: "A",
    q5: "C",
    q6: "D",
    q7: "B",
    q8: "A",
    q9: "C",
    q10: "B",
    q11: "A",
    q12: "D",
    q13: "C",
    q14: "A",
    q15: "B",
    q16: "D",
    q17: "A",
    q18: "B",
    q19: "C",
    q20: "D",
  },
};

export type ObjectiveAnswers = Record<ObjectiveQuestionId, AnswerLetter | null>;

export type ObjectiveResult = {
  score: number;
  correctCount: number;
  results: Record<ObjectiveQuestionId, boolean>;
};

/**
 * Scores answers against the key for `version`. Pass the submission's own
 * assessment_version when re-reading a stored row, so older submissions are
 * always graded against the key that was live when they were taken.
 */
export function scoreObjectiveAnswers(
  answers: ObjectiveAnswers,
  version: ObjectiveAssessmentVersion = OBJECTIVE_ASSESSMENT_VERSION,
): ObjectiveResult {
  const key = ANSWER_KEYS[version] ?? ANSWER_KEYS[OBJECTIVE_ASSESSMENT_VERSION];
  const results = {} as Record<ObjectiveQuestionId, boolean>;
  let correctCount = 0;

  for (const id of OBJECTIVE_QUESTION_IDS) {
    const correct = answers[id] === key[id];
    results[id] = correct;
    if (correct) correctCount += 1;
  }

  return {
    score: correctCount * MARKS_PER_OBJECTIVE_QUESTION,
    correctCount,
    results,
  };
}
