import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleWords = [
  {
    english: 'hello',
    russian: 'привет',
    exampleEn: 'Hello, how are you?',
    exampleRu: 'Привет, как дела?',
    isFavorite: false
  },
  {
    english: 'world',
    russian: 'мир',
    exampleEn: 'Hello world!',
    exampleRu: 'Привет мир!',
    isFavorite: true
  },
  {
    english: 'computer',
    russian: 'компьютер',
    exampleEn: 'I work on my computer every day.',
    exampleRu: 'Я работаю на компьютере каждый день.',
    isFavorite: false
  },
  {
    english: 'beautiful',
    russian: 'красивый',
    exampleEn: 'She is a beautiful woman.',
    exampleRu: 'Она красивая женщина.',
    isFavorite: true
  },
  {
    english: 'language',
    russian: 'язык',
    exampleEn: 'English is a global language.',
    exampleRu: 'Английский - это глобальный язык.',
    isFavorite: false
  },
  {
    english: 'learning',
    russian: 'обучение',
    exampleEn: 'Learning new words is fun.',
    exampleRu: 'Изучение новых слов - это весело.',
    isFavorite: true
  },
  {
    english: 'knowledge',
    russian: 'знание',
    exampleEn: 'Knowledge is power.',
    exampleRu: 'Знание - это сила.',
    isFavorite: false
  },
  {
    english: 'success',
    russian: 'успех',
    exampleEn: 'Hard work leads to success.',
    exampleRu: 'Упорный труд ведет к успеху.',
    isFavorite: true
  },
  {
    english: 'friend',
    russian: 'друг',
    exampleEn: 'He is my best friend.',
    exampleRu: 'Он мой лучший друг.',
    isFavorite: false
  },
  {
    english: 'family',
    russian: 'семья',
    exampleEn: 'Family is the most important thing.',
    exampleRu: 'Семья - это самое важное.',
    isFavorite: true
  }
];

async function main() {
  console.log('Starting database seeding...');
  
  // Очистить существующие данные
  await prisma.answer.deleteMany();
  await prisma.word.deleteMany();
  
  console.log('Cleared existing data');
  
  // Добавить слова
  for (const wordData of sampleWords) {
    await prisma.word.create({
      data: wordData
    });
  }
  
  console.log(`Added ${sampleWords.length} words to the database`);
  
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
