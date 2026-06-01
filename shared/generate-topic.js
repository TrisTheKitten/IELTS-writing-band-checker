export const GENERATE_TOPIC_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    question: { type: "STRING" }
  },
  required: ["question"]
};

export function buildGenerateTopicPrompt({ previousTopic = "" } = {}) {
  const lines = [
    "You create authentic IELTS Academic or General Training Writing Task 2 questions for exam practice.",
    "Return only valid JSON that matches the provided schema.",
    "Write one complete question in English.",
    "Use standard IELTS wording: state the topic, then give the instruction (discuss both views, agree/disagree, advantages/disadvantages, causes/solutions, or direct essay).",
    "Keep the question between 35 and 90 words.",
    "Do not include a model answer, outline, or band score."
  ];

  const trimmedPrevious = String(previousTopic || "").trim();

  if (trimmedPrevious) {
    lines.push(
      "The student already has this question — write a different Task 2 question on another theme:",
      trimmedPrevious
    );
  } else {
    lines.push("Pick a varied, realistic theme suitable for IELTS (society, education, technology, environment, health, work, etc.).");
  }

  return lines.join("\n");
}

export function parseGeneratedTopic(payload) {
  const question = String(payload?.question || "").trim();

  if (!question) {
    return { ok: false, error: "AI returned an empty question. Try again." };
  }

  return { ok: true, question };
}
