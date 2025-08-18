import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  CheckAnswerRequest, 
  CheckAnswerResponse, 
  ApiResponse, 
  Answer 
} from '../types';

const router = Router();
const prisma = new PrismaClient();

// Проверить ответ
router.post('/check', async (req: Request<{}, {}, CheckAnswerRequest>, res: Response<ApiResponse<CheckAnswerResponse>>) => {
  try {
    const { wordId, answer } = req.body;
    
    if (!wordId || !answer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Word ID and answer are required' 
      });
    }
    
    // Получить слово
    const word = await prisma.word.findUnique({
      where: { id: wordId }
    });
    
    if (!word) {
      return res.status(404).json({ 
        success: false, 
        error: 'Word not found' 
      });
    }
    
    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = word.english.toLowerCase().trim();
    
    // Проверить точное совпадение
    const isCorrect = userAnswer === correctAnswer;
    
    // Проверить частичное совпадение
    let isPartial = false;
    let hint = '';
    
    if (!isCorrect && userAnswer.length > 0) {
      // Проверить, является ли ответ началом правильного слова
      if (correctAnswer.startsWith(userAnswer)) {
        isPartial = true;
        hint = `Правильно! Продолжайте... (${correctAnswer.length - userAnswer.length} букв осталось)`;
      }
      // Проверить, содержит ли правильный ответ введенный текст
      else if (correctAnswer.includes(userAnswer)) {
        isPartial = true;
        hint = 'Частично правильно! Попробуйте еще раз';
      }
      // Проверить похожесть (например, опечатки)
      else if (levenshteinDistance(userAnswer, correctAnswer) <= 2) {
        isPartial = true;
        hint = 'Близко! Проверьте правописание';
      }
    }
    
    // Сохранить ответ в базу данных
    await prisma.answer.create({
      data: {
        wordId,
        answer: userAnswer,
        isCorrect
      }
    });
    
    const response: CheckAnswerResponse = {
      isCorrect,
      isPartial,
      hint: isPartial ? hint : undefined,
      correctAnswer: word.english
    };
    
    return res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error checking answer:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to check answer' 
    });
  }
});

// Получить статистику ответов для слова
router.get('/word/:wordId', async (req: Request, res: Response<ApiResponse<Answer[]>>) => {
  try {
    const { wordId } = req.params;
    
    const answers = await prisma.answer.findMany({
      where: { wordId: parseInt(wordId) },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({ success: true, data: answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch answers' 
    });
  }
});

// Получить общую статистику
router.get('/stats', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const totalAnswers = await prisma.answer.count();
    const correctAnswers = await prisma.answer.count({
      where: { isCorrect: true }
    });
    
    const totalWords = await prisma.word.count();
    const learnedWords = await prisma.word.count({
      where: {
        answers: {
          some: {
            isCorrect: true
          }
        }
      }
    });
    
    const favoriteWords = await prisma.word.count({
      where: { isFavorite: true }
    });
    
    const stats = {
      totalAnswers,
      correctAnswers,
      accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      totalWords,
      learnedWords,
      favoriteWords
    };
    
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    });
  }
});

// Функция для вычисления расстояния Левенштейна
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

export { router as answerRoutes };
