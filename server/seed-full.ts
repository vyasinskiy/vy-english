import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Используем абсолютный путь
const filePath = path.resolve(__dirname, 'translations.json');
console.log('Using absolute file path:', filePath);

async function main() {
  try {
    console.log('Starting database seeding...');

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }

    // Логируем, что файл найден
    console.log('File found, proceeding to read the file...');
    
    // Чтение данных из JSON файла
    const wordsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Successfully read ${wordsData.length} words from the file`);

    // Очистить существующие данные
    console.log('Clearing existing data...');
    await prisma.answer.deleteMany();
    await prisma.word.deleteMany();
    console.log('Cleared existing data');

    // Добавление слов в базу данных
    for (const item of wordsData) {
      const wordData = {
        english: item['Search text'],
        russian: item['Translation text'],
        exampleEn: item['Search example'],
        exampleRu: item['Translation example'],
        isFavorite: false, // Можно добавить логику для избранных слов, если нужно
      };

      // Логируем добавление слова
      console.log(`Adding word: ${item['Search text']} -> ${item['Translation text']}`);

      // Создаем слово
      const word = await prisma.word.create({
        data: wordData
      });

      // Добавление ответа
      await prisma.answer.create({
        data: {
          wordId: word.id,
          answer: item['Search text'],
          isCorrect: true,
        }
      });
    }

    console.log(`Added ${wordsData.length} words to the database`);

    console.log('Database seeding completed!');
  } catch (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();