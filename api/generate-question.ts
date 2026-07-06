export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const CATEGORY_PROMPTS: Record<string, string> = {
    general:
      'general knowledge: science, history, geography, nature, culture, space, art, famous facts',
    football:
      'football/soccer: FIFA World Cup, UEFA Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, famous players, records, football history',
    ai:
      'artificial intelligence, machine learning, deep learning, neural networks, large language models, generative AI, blockchain, Web3, cryptocurrency, robotics, emerging technology',
  };

  const DIFFICULTY_PROMPTS: Record<string, string> = {
    easy: 'straightforward, well-known facts that most people would know',
    medium: 'requires some specific knowledge, moderately challenging',
    hard: 'requires deep expertise or very specific/obscure knowledge',
  };

  const { category, difficulty } = req.body || {};
  if (!CATEGORY_PROMPTS[category] || !DIFFICULTY_PROMPTS[difficulty]) {
    res.status(400).json({ error: 'Invalid category or difficulty' });
    return;
  }

  const apiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter((key): key is string => Boolean(key));

  if (apiKeys.length === 0) {
    res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
    return;
  }

  async function callGeminiWithKey(key: string, prompt: string) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 800 },
        }),
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      const err = new Error(`Gemini API returned ${response.status}: ${errText}`);
      (err as { status?: number }).status = response.status;
      throw err;
    }
    return response.json();
  }

  const prompt = `You are a quiz question generator for Nexora, a competitive learning platform.

Generate exactly ONE multiple-choice question about: ${CATEGORY_PROMPTS[category]}
Difficulty: ${DIFFICULTY_PROMPTS[difficulty]}

STRICT RULES:
- Return ONLY valid JSON. No markdown, no code blocks, no extra text.
- Keep the question and all options SHORT (max ~15 words each) so the JSON always completes fully within the token limit.
- Question must be factually accurate.
- All 4 options must be plausible; only one is correct.
- Explanation: 1 short sentence.
- Language: English ONLY.
- Generate a unique question — avoid common/repetitive questions.

Return EXACTLY this JSON (nothing else):
{"question":"Your question here?","options":{"A":"First option","B":"Second option","C":"Third option","D":"Fourth option"},"correct":"B","explanation":"Brief factual explanation."}`;

  let lastError = 'Unknown error';
  let data: any = null;

  outer: for (let attempt = 1; attempt <= 2; attempt++) {
    for (const key of apiKeys) {
      try {
        data = await callGeminiWithKey(key, prompt);
        break outer;
      } catch (err: any) {
        lastError = err?.message || 'Unknown error';
        const status = err?.status;
        if (status === 429 || status === 403) {
          // quota/auth issue on this key — try the next key
          continue;
        }
        // some other error — still try next key as a safety net,
        // but don't treat it as expected
        continue;
      }
    }
    if (data) break;
    await new Promise((r) => setTimeout(r, 600));
  }

  if (!data) {
    res.status(502).json({ error: `Failed to generate question: ${lastError}` });
    return;
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.question || !parsed.options || !parsed.correct || !parsed.explanation) {
    throw new Error('AI response missing required fields');
  }
  if (!['A', 'B', 'C', 'D'].includes(parsed.correct)) {
    throw new Error('AI returned invalid correct answer key');
  }

  res.status(200).json(parsed);
  return;
}
