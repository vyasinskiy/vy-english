import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  CreateWordRequest, 
  UpdateWordRequest, 
  ApiResponse, 
  Word,
  StudyWordResponse, 
} from '../types';

const router = Router();
const prisma = new PrismaClient();

// Получить все слова
router.get('/', async (req: Request, res: Response<ApiResponse<Word[]>>) => {
  try {
    const words = await prisma.word.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({ success: true, data: words });
  } catch (error) {
    console.error('Error fetching words:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch words' 
    });
  }
});

// Получить слово для изучения (без правильного ответа)
router.get('/study', async (req: Request, res: Response<ApiResponse<StudyWordResponse>>) => {
  try {
    const { favoriteOnly, excludeId } = req.query as { favoriteOnly?: string; excludeId?: string };
    
    let whereClause: any = {};
    
    if (favoriteOnly === 'true') {
      whereClause.isFavorite = true;
    }
    
    // Условие исключения текущего слова (если передан excludeId)
    const excludeCondition = excludeId ? { id: { not: parseInt(excludeId) } } : {};

    // Пул слов без правильных ответов
    const whereUnlearned = {
      ...whereClause,
      ...excludeCondition,
      answers: {
        none: {
          isCorrect: true
        }
      }
    } as const;

    const totalUnlearned = await prisma.word.count({ where: whereUnlearned });

    if (totalUnlearned > 0) {
      const randomSkip = Math.floor(Math.random() * totalUnlearned);
      const candidates = await prisma.word.findMany({
        where: whereUnlearned,
        skip: randomSkip,
        take: 1
      });
      if (candidates[0]) {
        return res.json({ success: true, data: {word: candidates[0], unlearnedCount: totalUnlearned } });
      }
    }

    return res.status(404).json({ success: false, error: 'No words available for study' });
  } catch (error) {
    console.error('Error fetching study word:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch study word' 
    });
  }
});

// Получить избранные слова
router.get('/favorites', async (req: Request, res: Response<ApiResponse<Word[]>>) => {
  try {
    const words = await prisma.word.findMany({
      where: { isFavorite: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({ success: true, data: words });
  } catch (error) {
    console.error('Error fetching favorite words:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch favorite words' 
    });
  }
});

// Получить слово по ID
router.get('/:id', async (req: Request, res: Response<ApiResponse<Word>>) => {
  try {
    const { id } = req.params;
    const word = await prisma.word.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!word) {
      return res.status(404).json({ 
        success: false, 
        error: 'Word not found' 
      });
    }
    
    return res.json({ success: true, data: word });
  } catch (error) {
    console.error('Error fetching word:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch word' 
    });
  }
});

// Создать новое слово
router.post('/', async (req: Request<{}, {}, CreateWordRequest>, res: Response<ApiResponse<Word>>) => {
  try {
    const { english, russian, exampleEn, exampleRu } = req.body;
    
    if (!english || !russian || !exampleEn || !exampleRu) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    const word = await prisma.word.create({
      data: {
        english: english.toLowerCase().trim(),
        russian: russian.trim(),
        exampleEn: exampleEn.trim(),
        exampleRu: exampleRu.trim()
      }
    });
    
    return res.status(201).json({ success: true, data: word });
  } catch (error) {
    console.error('Error creating word:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create word' 
    });
  }
});

// Обновить слово
router.put('/:id', async (req: Request<{id: string}, {}, UpdateWordRequest>, res: Response<ApiResponse<Word>>) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Очистить undefined значения
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    if (cleanData.english) {
      cleanData.english = cleanData.english.toLowerCase().trim();
    }
    
    const word = await prisma.word.update({
      where: { id: parseInt(id) },
      data: cleanData
    });
    
    return res.json({ success: true, data: word });
  } catch (error) {
    console.error('Error updating word:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update word' 
    });
  }
});

// Удалить слово
router.delete('/:id', async (req: Request, res: Response<ApiResponse<{}>>) => {
  try {
    const { id } = req.params;
    
    await prisma.word.delete({
      where: { id: parseInt(id) }
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting word:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to delete word' 
    });
  }
});

// Переключить избранное
router.patch('/:id/favorite', async (req: Request, res: Response<ApiResponse<Word>>) => {
  try {
    const { id } = req.params;
    
    const currentWord = await prisma.word.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!currentWord) {
      return res.status(404).json({ 
        success: false, 
        error: 'Word not found' 
      });
    }
    
    const word = await prisma.word.update({
      where: { id: parseInt(id) },
      data: { isFavorite: !currentWord.isFavorite }
    });
    
    return res.json({ success: true, data: word });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle favorite' 
    });
  }
});

export { router as wordRoutes };
