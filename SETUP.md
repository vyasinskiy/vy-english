# Настройка English Words Learning App

## Шаг 1: Установка PostgreSQL

### macOS (с Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
Скачайте и установите PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/

## Шаг 2: Создание базы данных

1. Подключитесь к PostgreSQL:
```bash
psql -U postgres
```

2. Создайте базу данных:
```sql
CREATE DATABASE english_words_db;
```

3. Выйдите из psql:
```sql
\q
```

## Шаг 3: Настройка переменных окружения

1. Создайте файл `.env` в корневой папке проекта:
```bash
cp env.example .env
```

2. Отредактируйте файл `.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/english_words_db"
PORT=5000
```

Замените `your_password` на пароль, который вы установили для пользователя postgres.

## Шаг 4: Настройка базы данных

```bash
# Применение схемы к базе данных
npm run db:push

# Заполнение базы данных начальными данными
npm run db:seed
```

## Шаг 5: Запуск приложения

### Режим разработки (рекомендуется)
```bash
npm run dev
```

Это запустит одновременно:
- Backend сервер на порту 5000
- Frontend приложение на порту 3000

### Отдельный запуск

Backend:
```bash
npm run server
```

Frontend (в новом терминале):
```bash
npm run client
```

## Шаг 6: Проверка работы

1. Откройте браузер и перейдите на http://localhost:3000
2. Вы должны увидеть главную страницу приложения
3. Перейдите на вкладку "Study" для начала изучения слов

## Дополнительные команды

### Просмотр базы данных через Prisma Studio
```bash
npm run db:studio
```
Откроется веб-интерфейс на http://localhost:5555 для просмотра и редактирования данных.

### Сборка для продакшена
```bash
npm run build
```

### Проверка типов TypeScript
```bash
npm run build:server
```

## Устранение проблем

### Ошибка подключения к базе данных
1. Убедитесь, что PostgreSQL запущен
2. Проверьте правильность DATABASE_URL в файле .env
3. Убедитесь, что база данных создана

### Ошибка "Module not found"
```bash
npm install
cd client && npm install
```

### Ошибка портов
Если порты 3000 или 5000 заняты, измените их в файле .env:
```env
PORT=5001
```

И в client/package.json добавьте:
```json
"start": "PORT=3001 react-scripts start"
```

## Структура базы данных

После успешной настройки в базе данных будут созданы таблицы:
- `words` - слова для изучения
- `answers` - ответы пользователей

Начальные данные включают 10 английских слов с переводами и примерами использования.
