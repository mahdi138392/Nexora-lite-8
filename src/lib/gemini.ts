export interface QuestionData {
  questionId: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  xpEarned: number;
  streakBonus: number;
  newStreak: number;
  totalXP: number;
  level: number;
  levelProgress: number;
  xpToNextLevel: number;
  rank: string;
  rankScore: number;
  correctAnswers: number;
  totalChallenges: number;
}

export async function generateQuestion(
  category: 'general' | 'football' | 'ai',
  difficulty: 'easy' | 'medium' | 'hard',
  walletAddress: string
): Promise<QuestionData> {
  const response = await fetch('/api/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, difficulty, walletAddress }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody.error || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function submitAnswer(
  questionId: string,
  walletAddress: string,
  selectedAnswer: string | null,
  category: 'general' | 'football' | 'ai',
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<AnswerResult> {
  const response = await fetch('/api/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId,
      walletAddress,
      selectedAnswer,
      category,
      difficulty,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody.error || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}
