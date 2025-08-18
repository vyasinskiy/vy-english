export interface Word {
  id: number;
  english: string;
  russian: string;
  exampleEn: string;
  exampleRu: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface Answer {
  id: number;
  wordId: number;
  answer: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface CreateWordRequest {
  english: string;
  russian: string;
  exampleEn: string;
  exampleRu: string;
}

export interface UpdateWordRequest {
  english?: string;
  russian?: string;
  exampleEn?: string;
  exampleRu?: string;
  isFavorite?: boolean;
}

export interface CheckAnswerRequest {
  wordId: number;
  answer: string;
}

export interface CheckAnswerResponse {
  isCorrect: boolean;
  isPartial: boolean;
  hint?: string;
  correctAnswer: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Stats {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  totalWords: number;
  learnedWords: number;
  favoriteWords: number;
}
