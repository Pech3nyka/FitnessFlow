# FitnessFlow - Веб-приложение для фитнес-клуба

## Описание проекта

FitnessFlow - это веб-приложение для автоматизации работы фитнес-клуба. Позволяет клиентам записываться на тренировки, отслеживать прогресс, а администраторам - управлять расписанием.

## Функциональность

- ✅ Регистрация и авторизация пользователей (JWT)
- ✅ Разграничение ролей (Клиент / Администратор)
- ✅ Просмотр расписания тренировок
- ✅ Запись на тренировки с проверкой свободных мест
- ✅ Личный кабинет с данными пользователя
- ✅ Админ-панель (управление тренировками)

## Технологии

- **Frontend:** Next.js 15, React, TypeScript
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt

## Установка и запуск

### Требования
- Node.js (v18+)
- PostgreSQL (v15+)

### 1. Клонирование репозитория
```bash
git clone https://github.com/ваш-username/FitnessFlow.git
cd FitnessFlow
```

### 2. Настройка базы данных
```bash
CREATE DATABASE fitnessflow_db;
```

### 3. Настройка бэкенда
```bash
cd backend
npm install
cp .env.example .env  # и заполните переменные
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 4. Настройка фронтенда
```bash
cd frontend
npm install
npm run dev
```

### 5. Ссылки для локальной проверки
```bash
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```