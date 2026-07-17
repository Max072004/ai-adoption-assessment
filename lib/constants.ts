export const DEPARTMENT_AAM = {
  Marketing: 1.0,
  "Editor / Media": 1.0,
  "AI / Tech": 1.0,
  Sales: 0.9,
  Accounts: 0.85,
  HR: 0.8,
  Admin: 0.75,
  Procurement: 0.75,
  Operations: 0.65,
  "Engineering / Civil / Site": 0.65,
} as const;

export const DEPARTMENTS = Object.keys(DEPARTMENT_AAM);

export const DEPARTMENT_CONTEXT_NOTES: Record<string, string> = {
  Operations:
    "Judge mainly on whether they use AI for reports, planning, client communication, and problem-solving - not on following news.",
  "Engineering / Civil / Site":
    "AI use for inspection reports, technical documentation, and planning matters most.",
  HR: "AI use in drafting JDs, employee communications, policy docs, or analysis is most relevant.",
  Accounts:
    "AI use in reconciliation, GST working, reports, and data analysis is what we look for.",
  Admin:
    "AI use in scheduling, drafting communications, and document management counts.",
  Sales:
    "AI use in lead research, pitch preparation, outreach, and client communication is most relevant.",
  Marketing:
    "AI use in content, campaigns, ad creatives, SEO, and analytics is expected to be high.",
  "Editor / Media":
    "AI use in writing, editing, subtitles, content creation, and research is the main measure.",
  "AI / Tech":
    "Deep AI tool usage, building with AI, and experimentation is the full expectation.",
  Procurement:
    "AI use in vendor comparison, documentation, and planning is most relevant.",
};

export const Q6_OPTIONS = [
  "Give up and do it manually",
  "Try rephrasing/asking differently",
  "Try a different AI tool",
  "Look up how others solved similar problems",
] as const;

export const Q7_OPTIONS = [
  "Got worse / forgot how to use it",
  "Same as before",
  "Slightly better",
  "Significantly better",
] as const;

export const Q1_FREQUENCY_OPTIONS = [
  "Daily",
  "A few times a week",
  "Weekly",
  "A few times a month",
  "Rarely or never",
] as const;

export const Q3_IMPACT_OPTIONS = [
  "No measurable impact",
  "Helps complete a few tasks faster",
  "Saves meaningful time every week",
  "Allows me to handle more work than before",
  "Has significantly changed my productivity",
] as const;

export const Q5_WORKFLOW_OPTIONS = [
  "Not part of any process",
  "Used occasionally",
  "Routine in 1 process",
  "Routine in multiple processes",
  "Changed how my team works",
] as const;

export const Q9_CHANGE_OPTIONS = [
  "I use AI much less than before",
  "I use AI slightly less than before",
  "About the same",
  "I use AI slightly more than before",
  "I use AI significantly more than before",
] as const;

export const Q10_BLOCKER_OPTIONS = [
  "Access",
  "Time",
  "Task doesn't suit AI",
  "Privacy concerns",
  "Don't know where to start",
  "No real blocker",
] as const;

export const SESSION_COOKIE_NAME = "ai_adoption_admin_session";
