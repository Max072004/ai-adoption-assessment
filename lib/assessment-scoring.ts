// SERVER ONLY. Holds the Q1-Q20 answer key and the objective scorer.
// Never import this module from a client component ("use client") or from any
// code path that ends up in a browser bundle. Only route handlers under
// app/api/** may import it.

import {
  MARKS_PER_OBJECTIVE_QUESTION,
  OBJECTIVE_QUESTION_IDS,
  type AnswerLetter,
  type ObjectiveQuestionId,
} from "@/lib/assessment";

const ANSWER_KEY: Record<ObjectiveQuestionId, AnswerLetter> = {
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
};

export type ObjectiveAnswers = Record<ObjectiveQuestionId, AnswerLetter | null>;

export type ObjectiveResult = {
  score: number;
  correctCount: number;
  results: Record<ObjectiveQuestionId, boolean>;
};

export function scoreObjectiveAnswers(answers: ObjectiveAnswers): ObjectiveResult {
  const results = {} as Record<ObjectiveQuestionId, boolean>;
  let correctCount = 0;

  for (const id of OBJECTIVE_QUESTION_IDS) {
    const correct = answers[id] === ANSWER_KEY[id];
    results[id] = correct;
    if (correct) correctCount += 1;
  }

  return {
    score: correctCount * MARKS_PER_OBJECTIVE_QUESTION,
    correctCount,
    results,
  };
}
