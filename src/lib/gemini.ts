import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('[Nexora] VITE_GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface QuestionData {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

const CATEGORY_PROMPTS = {
  general:
    'general knowledge: science, history, geography, nature, culture, space, art, famous facts',
  football:
    'football/soccer: FIFA World Cup, UEFA Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, famous players, records, football history',
  ai:
    'artificial intelligence, machine learning, deep learning, neural networks, large language models, generative AI, blockchain, Web3, cryptocurrency, robotics, emerging technology',
};

const DIFFICULTY_PROMPTS = {
  easy:   'straightforward, well-known facts that most people would know',
  medium: 'requires some specific knowledge, moderately challenging',
  hard:   'requires deep expertise or very specific/obscure knowledge',
};

export async function generateQuestion(
  category: 'general' | 'football' | 'ai',
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<QuestionData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.9, maxOutputTokens: 512 },
  });

  const prompt = `You are a quiz question generator for Nexora, a competitive learning platform.

Generate exactly ONE multiple-choice question about: ${CATEGORY_PROMPTS[category]}
Difficulty: ${DIFFICULTY_PROMPTS[difficulty]}

STRICT RULES:
- Return ONLY valid JSON. No markdown, no code blocks, no extra text.
- Question must be factually accurate.
- All 4 options must be plausible; only one is correct.
- Explanation: 1-2 sentences, clear and educational.
- Language: English ONLY.
- Generate a unique question — avoid common/repetitive questions.

Return EXACTLY this JSON (nothing else):
{"question":"Your question here?","options":{"A":"First option","B":"Second option","C":"Third option","D":"Fourth option"},"correct":"B","explanation":"Brief factual explanation."}`;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text()
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed: QuestionData = JSON.parse(raw);

      if (!parsed.question || !parsed.options || !parsed.correct || !parsed.explanation) {
        throw new Error('AI response missing required fields');
      }
      if (!['A', 'B', 'C', 'D'].includes(parsed.correct)) {
        throw new Error('AI returned invalid correct answer key');
      }
      if (!parsed.options.A || !parsed.options.B || !parsed.options.C || !parsed.options.D) {
        throw new Error('AI response missing one or more options');
      }

      return parsed;
    } catch (err: unknown) {
      console.error(`[Gemini] Attempt ${attempt} failed:`, err);
      lastError = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 700));
      }
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'Unknown error';
  throw new Error(`Failed to generate question: ${detail}`);
}
