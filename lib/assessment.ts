// Client-safe definitions for the objective assessment.
// The answer keys intentionally live in lib/assessment-scoring.ts (server only).

/** Version written on NEW submissions. Older versions stay readable. */
export const OBJECTIVE_ASSESSMENT_VERSION = "objective_v2" as const;

/** Every objective version, oldest first. Legacy Month 1/2/3 rows use null. */
export const OBJECTIVE_ASSESSMENT_VERSIONS = [
  "objective_v1",
  "objective_v2",
] as const;

export type ObjectiveAssessmentVersion =
  (typeof OBJECTIVE_ASSESSMENT_VERSIONS)[number];

/**
 * True for any objective-model submission, current or past. Use this for
 * "which scoring model does this row use" checks; never compare directly
 * against OBJECTIVE_ASSESSMENT_VERSION, which only names the current one.
 */
export function isObjectiveVersion(
  version: string | null | undefined,
): version is ObjectiveAssessmentVersion {
  return (OBJECTIVE_ASSESSMENT_VERSIONS as readonly string[]).includes(
    version ?? "",
  );
}

export const OBJECTIVE_QUESTION_IDS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
  "q11",
  "q12",
  "q13",
  "q14",
  "q15",
  "q16",
  "q17",
  "q18",
  "q19",
  "q20",
] as const;

export type ObjectiveQuestionId = (typeof OBJECTIVE_QUESTION_IDS)[number];
export type ObjectiveAnswerColumn = `${ObjectiveQuestionId}_answer`;

export const ANSWER_LETTERS = ["A", "B", "C", "D"] as const;
export type AnswerLetter = (typeof ANSWER_LETTERS)[number];

export const MARKS_PER_OBJECTIVE_QUESTION = 2;
export const OBJECTIVE_MAX_SCORE =
  OBJECTIVE_QUESTION_IDS.length * MARKS_PER_OBJECTIVE_QUESTION; // 40

// Manual scale reuses the established 1-10 per-question convention from the
// legacy scores table.
export const MANUAL_SCORE_MIN = 1;
export const MANUAL_SCORE_MAX = 10;
export const FINAL_MAX_SCORE = OBJECTIVE_MAX_SCORE + MANUAL_SCORE_MAX * 2; // 60

// Legacy final scores are out of 80 and flagged below 50. The same 62.5%
// cut-off is applied to the objective model so flags stay comparable.
export const LEGACY_MAX_SCORE = 80;
export const LEGACY_FLAG_THRESHOLD = 50;
export const OBJECTIVE_FLAG_THRESHOLD =
  (LEGACY_FLAG_THRESHOLD / LEGACY_MAX_SCORE) * FINAL_MAX_SCORE; // 37.5

export function answerColumn(id: ObjectiveQuestionId): ObjectiveAnswerColumn {
  return `${id}_answer`;
}

export type ObjectiveQuestion = {
  id: ObjectiveQuestionId;
  title: string;
  options: Record<AnswerLetter, string>;
};

/**
 * Canonical question bank. The letter a question is stored under never
 * changes, regardless of the order it is displayed in (see AssessmentOrder).
 */
export const OBJECTIVE_QUESTIONS: readonly ObjectiveQuestion[] = [
  {
    id: "q1",
    title:
      "You have a 40-page vendor contract to review before a meeting in two hours. What is the best use of AI here?",
    options: {
      A: "Ask AI to read it and tell you whether to sign it",
      B: "Skip AI and read all 40 pages yourself",
      C: "Ask AI to summarise the key terms, payment conditions and anything unusual, then read those sections yourself",
      D: "Ask AI to rewrite the contract in your favour and send it to the vendor",
    },
  },
  {
    id: "q2",
    title:
      "AI tools now offer assistants that keep working on a task after you close the chat and report back when finished. What is the main practical difference from a normal chat?",
    options: {
      A: "The answers it gives are more accurate than in a normal chat",
      B: "It can carry out a multi-step task over time and come back with the finished result, instead of replying instantly in one message",
      C: "It no longer needs any instructions from you",
      D: "It works without an internet connection",
    },
  },
  {
    id: "q3",
    title: "Which of these is AI least suited to do on its own?",
    options: {
      A: "Drafting a first version of a job description",
      B: "Summarising 30 customer feedback forms into common themes",
      C: "Converting a messy list of addresses into a clean table",
      D: "Deciding which of two team members should be promoted",
    },
  },
  {
    id: "q4",
    title:
      "You are replying to a difficult message from a client or vendor. Which input most improves what AI produces?",
    options: {
      A: "The original message you received, what actually happened, and what you are able to offer",
      B: "An instruction to “be professional and polite”",
      C: "A request to make the reply longer and more detailed",
      D: "A request to write in formal business English",
    },
  },
  {
    id: "q5",
    title:
      "Newer AI assistants ask for your confirmation before certain actions. Which type of action should always require it?",
    options: {
      A: "Summarising a document you uploaded",
      B: "Searching the web for background information",
      C: "Sending a message, making a payment, or deleting files",
      D: "Drafting something for you to review afterwards",
    },
  },
  {
    id: "q6",
    title:
      "An AI draft is 80% right, but the tone is too formal and one fact is wrong. What is the fastest effective next step?",
    options: {
      A: "Start a fresh chat with a much longer prompt",
      B: "Accept it, since 80% is good enough for a draft",
      C: "Rewrite the whole thing yourself",
      D: "Reply in the same chat: fix that specific fact, ask for a more conversational tone, keep the rest",
    },
  },
  {
    id: "q7",
    title:
      "Most AI platforms now offer several models — faster cheaper ones alongside slower, more capable ones. What is the sensible way to use this?",
    options: {
      A: "Always use the most powerful model, for every task",
      B: "Match the model to the task — lighter ones for simple drafting and summarising, stronger ones for complex analysis",
      C: "Always use the cheapest model to control cost",
      D: "Always use whichever model was released most recently",
    },
  },
  {
    id: "q8",
    title:
      "You want AI output to match your team's existing report format. What works most reliably?",
    options: {
      A: "Paste a previous report and ask it to follow the same structure",
      B: "Describe the format in detail in words",
      C: "Ask it to “use a clean, professional format”",
      D: "Ask it to deliver the output as a PDF",
    },
  },
  {
    id: "q9",
    title:
      "AI gives you a statistic with a confident-sounding source for a client proposal. What should you do?",
    options: {
      A: "Use it, since it came with a source",
      B: "Ask the AI whether it is certain",
      C: "Open the source yourself and confirm it exists and actually says that",
      D: "Reword it so it sounds less specific",
    },
  },
  {
    id: "q10",
    title:
      "AI assistants can now connect directly to tools like your email, calendar, drive or CRM. What does this mainly change?",
    options: {
      A: "The assistant stops making mistakes, because it now has real data",
      B: "It can read real information and take actions in those tools, so what it is allowed to access has to be controlled",
      C: "It makes the assistant respond faster",
      D: "Your company's data becomes a permanent part of the AI model",
    },
  },
  {
    id: "q11",
    title:
      "You used AI to rephrase three sentences in an internal email for clarity. How much checking is appropriate?",
    options: {
      A: "Read it once to confirm the meaning hasn't changed, then send it",
      B: "Ask a colleague to review it before sending",
      C: "Check each sentence against an external source",
      D: "Rewrite it manually to be safe",
    },
  },
  {
    id: "q12",
    title:
      "An AI agent with access to company systems takes a wrong action. Who is accountable?",
    options: {
      A: "The AI vendor, because it built the system",
      B: "Nobody — it is an accepted risk of automation",
      C: "The individual employee who typed the original request",
      D: "The company that deployed the agent and granted it that access",
    },
  },
  {
    id: "q13",
    title:
      "Which AI output carries the highest risk if it is wrong and goes out unchecked?",
    options: {
      A: "A brainstormed list of ideas for an internal discussion",
      B: "A rewritten set of internal meeting notes",
      C: "Figures in a financial statement being sent to a client",
      D: "Three draft subject lines for a newsletter",
    },
  },
  {
    id: "q14",
    title:
      "Today's leading AI tools can work with hundreds of pages of text in a single conversation. What does this practically enable?",
    options: {
      A: "You can analyse a long report, contract or set of records in one go, instead of pasting it in small pieces",
      B: "The AI is guaranteed not to miss any detail in the document",
      C: "Checking the output is no longer necessary",
      D: "The document is permanently added to the AI's training",
    },
  },
  {
    id: "q15",
    title:
      "You want AI to analyse a customer list containing names, phone numbers and purchase history. What is the right approach?",
    options: {
      A: "Paste the full list into any free AI tool — it is only contact information",
      B: "Remove or mask the personal details, or use the company-approved tool, before analysing it",
      C: "Never use AI on customer data under any circumstances",
      D: "Email the file to your personal account first, then upload it",
    },
  },
  {
    id: "q16",
    title: "Which of these can mainstream AI assistants now routinely do?",
    options: {
      A: "Guarantee the figures it extracts are correct",
      B: "Access your company's private files without being given permission",
      C: "Predict next quarter's revenue with certainty",
      D: "Turn a photo of a handwritten note or printed invoice into structured, editable text",
    },
  },
  {
    id: "q17",
    title:
      "You spend 45 minutes prompting AI for a task you could do manually in 15. What is the right conclusion?",
    options: {
      A: "Do this one manually, but if the task repeats every week, build a reusable prompt or workflow for it",
      B: "Keep going — time spent on AI always pays off eventually",
      C: "AI is not suitable for this kind of task",
      D: "Try a different AI tool and attempt it again",
    },
  },
  {
    id: "q18",
    title:
      "Which is something AI tools genuinely could not do reliably two years ago, but can now?",
    options: {
      A: "Producing grammatically correct writing",
      B: "Carrying out a multi-step task across different tools and reporting back when it is finished",
      C: "Generating text within seconds",
      D: "Answering general knowledge questions",
    },
  },
  {
    id: "q19",
    title:
      "A colleague says, “AI is useless for my work — I tried once and got a wrong answer.” What is the most useful response?",
    options: {
      A: "Agree, since AI is not reliable for most real work",
      B: "Tell them to send the same prompt again until the answer comes out right",
      C: "Help them find which parts of their work AI actually suits, and show them a better prompt for one of those",
      D: "Tell them the paid version would have got it right",
    },
  },
  {
    id: "q20",
    title: "Which best shows that AI has genuinely improved your work?",
    options: {
      A: "You now use AI every single day",
      B: "You have tried ten different AI tools this month",
      C: "Your prompts are much longer and more detailed than before",
      D: "A task that used to take three hours now takes forty minutes, at the same or better quality",
    },
  },
];

// ---------------------------------------------------------------------------
// Per-attempt randomisation
// ---------------------------------------------------------------------------

/**
 * The order one employee sees. Questions are shuffled, and so are the options
 * within each question, so two people filling the form at the same time get
 * different papers. Stored answers always use the CANONICAL letter from
 * OBJECTIVE_QUESTIONS, never the displayed position, so scoring, the answer
 * key and historical rows are unaffected by shuffling.
 */
export type AssessmentOrder = {
  questionIds: ObjectiveQuestionId[];
  optionOrder: Record<ObjectiveQuestionId, AnswerLetter[]>;
};

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function buildAssessmentOrder(): AssessmentOrder {
  return {
    questionIds: shuffled(OBJECTIVE_QUESTION_IDS),
    optionOrder: Object.fromEntries(
      OBJECTIVE_QUESTION_IDS.map((id) => [id, shuffled(ANSWER_LETTERS)]),
    ) as Record<ObjectiveQuestionId, AnswerLetter[]>,
  };
}

/** Canonical, unshuffled order. Used as a fallback and in tests. */
export const CANONICAL_ASSESSMENT_ORDER: AssessmentOrder = {
  questionIds: [...OBJECTIVE_QUESTION_IDS],
  optionOrder: Object.fromEntries(
    OBJECTIVE_QUESTION_IDS.map((id) => [id, [...ANSWER_LETTERS]]),
  ) as Record<ObjectiveQuestionId, AnswerLetter[]>,
};

/** Returns the questions in display order, with options reordered to match. */
export function orderedQuestions(order: AssessmentOrder) {
  const byId = new Map(OBJECTIVE_QUESTIONS.map((q) => [q.id, q]));
  return order.questionIds.flatMap((id) => {
    const question = byId.get(id);
    if (!question) return [];
    const letters = order.optionOrder[id] ?? [...ANSWER_LETTERS];
    return [
      {
        ...question,
        // Each entry keeps its canonical letter; only the position changes.
        orderedOptions: letters.map((letter) => ({
          letter,
          text: question.options[letter],
        })),
      },
    ];
  });
}

export const Q21_QUESTION =
  "Which AI tools have you used or seriously explored this month?";
export const Q21_OTHER_PROMPT = "Which other AI tool(s) did you use or explore?";

export const Q21_TOOL_OPTIONS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Microsoft Copilot",
  "Perplexity",
  "NotebookLM",
  "Grok",
  "DeepSeek",
  "Meta AI",
  "Google AI Studio",
  "Canva AI",
  "Midjourney",
  "Adobe Firefly",
  "Gamma",
  "Cursor",
  "GitHub Copilot",
  "Claude Code",
  "OpenAI Codex",
  "Replit",
  "Lovable",
  "Bolt",
  "v0",
  "Runway",
  "Kling AI",
  "ElevenLabs",
  "Suno",
  "Notion AI",
  "Zapier AI",
  "Make",
  "n8n",
  "Other",
] as const;

export type Q21Tool = (typeof Q21_TOOL_OPTIONS)[number];
export const Q21_OTHER_OPTION: Q21Tool = "Other";

export const Q22_QUESTION =
  "Share one example of AI-assisted work you completed this month.";
