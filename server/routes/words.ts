import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  CreateWordRequest, 
  UpdateWordRequest, 
  ApiResponse, 
  Word 
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
router.get('/study', async (req: Request, res: Response<ApiResponse<Word>>) => {
  try {
    const { favoriteOnly } = req.query;
    
    let whereClause: any = {};
    
    if (favoriteOnly === 'true') {
      whereClause.isFavorite = true;
    }
    
    // Найти слово, на которое еще не дан правильный ответ
    const word = await prisma.word.findFirst({
      where: {
        ...whereClause,
        answers: {
          none: {
            isCorrect: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (!word) {
      // Фоллбек: если все слова уже когда-то были отвечены правильно,
      // вернуть самое раннее по дате создания слово, чтобы не отдавать 404
      const fallbackWord = await prisma.word.findFirst({
        where: { ...whereClause },
        orderBy: { createdAt: 'asc' }
      });
      if (!fallbackWord) {
        return res.status(404).json({ 
          success: false, 
          error: 'No words available for study' 
        });
      }
      return res.json({ success: true, data: fallbackWord });
    }
    
    return res.json({ success: true, data: word });
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
