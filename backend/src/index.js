const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// !!MIDDLEWARE!!
app.use(cors());
app.use(express.json());

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

// !!АВТОРИЗАЦИЯ И ПОЛЬЗОВАТЕЛИ!!
// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        fullName: full_name,
        email,
        passwordHash,
        role: 'client'
      }
    });
    
    res.status(201).json({ message: 'Пользователь зарегистрирован', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Вход в систему
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

// Получение данных пользователя
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        userMemberships: {
          where: { isActive: true },
          include: { membership: true }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
});

// Обновление профиля
app.put('/api/user', authenticateToken, async (req, res) => {
  try {
    const { fullName, weight, height, goal } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { fullName, weight, height, goal }
    });
    
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

// !!ТРЕНИРОВКИ!!
// Получение расписания
app.get('/api/trainings', async (req, res) => {
  try {
    const trainings = await prisma.training.findMany({
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    
    const trainingsWithCapacity = await Promise.all(
      trainings.map(async (training) => {
        const bookedCount = await prisma.booking.count({
          where: { trainingId: training.id, status: 'booked' }
        });
        return {
          ...training,
          bookedCount,
          availableSeats: training.capacity - bookedCount
        };
      })
    );
    
    res.json(trainingsWithCapacity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении расписания' });
  }
});

// Получение одной тренировки по ID
app.get('/api/trainings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const training = await prisma.training.findUnique({
      where: { id }
    });
    if (!training) {
      return res.status(404).json({ error: 'Тренировка не найдена' });
    }
    res.json(training);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении тренировки' });
  }
});

// Создание тренировки (только админ)
app.post('/api/trainings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, trainer, date, time, duration, capacity, level } = req.body;
    
    const training = await prisma.training.create({
      data: {
        name,
        description,
        trainer,
        date: new Date(date),
        time,
        duration,
        capacity,
        level
      }
    });
    
    res.status(201).json(training);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании тренировки' });
  }
});

// Удаление тренировки (только админ)
app.delete('/api/trainings/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.booking.deleteMany({
      where: { trainingId: id }
    });
    
    await prisma.training.delete({
      where: { id }
    });
    
    res.json({ message: 'Тренировка удалена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении тренировки' });
  }
});

// !!ЗАПИСИ НА ТРЕНИРОВКИ!!
// Запись на тренировку
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.body;
    const userId = req.user.userId;
    
    const training = await prisma.training.findUnique({
      where: { id: trainingId }
    });
    
    if (!training) {
      return res.status(404).json({ error: 'Тренировка не найдена' });
    }
    
    const bookedCount = await prisma.booking.count({
      where: { trainingId, status: 'booked' }
    });
    
    if (bookedCount >= training.capacity) {
      return res.status(400).json({ error: 'Нет свободных мест' });
    }
    
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_trainingId: {
          userId,
          trainingId
        }
      }
    });
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Вы уже записаны на эту тренировку' });
    }
    
    const booking = await prisma.booking.create({
      data: {
        userId,
        trainingId,
        status: 'booked'
      }
    });
    
    res.status(201).json({ message: 'Вы успешно записаны на тренировку', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при записи на тренировку' });
  }
});

// Получение записей текущего пользователя
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        trainingId: true,
        status: true,
        bookedAt: true
      }
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении записей' });
  }
});

// Отмена записи на тренировку
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findFirst({
      where: {
        id: id,
        userId: req.user.userId
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    await prisma.booking.delete({
      where: { id: id }
    });
    
    res.json({ message: 'Запись успешно отменена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при отмене записи' });
  }
});

// !!ПРОГРЕСС ПОЛЬЗОВАТЕЛЯ!!
// Получение прогресса
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await prisma.progress.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'asc' }
    });
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении прогресса' });
  }
});

// Добавление записи прогресса
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { date, weight, bodyFat, notes } = req.body;
    
    const progress = await prisma.progress.create({
      data: {
        userId: req.user.userId,
        date: date ? new Date(date) : new Date(),
        weight,
        bodyFat,
        notes
      }
    });
    
    res.status(201).json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при добавлении записи прогресса' });
  }
});

// !!АБОНЕМЕНТЫ!!
// Получение всех абонементов
app.get('/api/memberships', async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany();
    res.json(memberships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении абонементов' });
  }
});

// Создание абонемента (только админ)
app.post('/api/memberships', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, durationDays } = req.body;
    
    // Преобразуем строки в числа
    const membership = await prisma.membership.create({
      data: { 
        name, 
        price: parseFloat(price), 
        durationDays: parseInt(durationDays) 
      }
    });
    res.status(201).json(membership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании абонемента' });
  }
});

// !!АДМИНИСТРИРОВАНИЕ!!
// Получение всех пользователей (только админ)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

// !!ЗАПУСК СЕРВЕРА!!
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📋 Доступные эндпоинты:`);
  console.log(`\n🔐 Авторизация и пользователи:`);
  console.log(`   POST   /api/register`);
  console.log(`   POST   /api/login`);
  console.log(`   GET    /api/user`);
  console.log(`   PUT    /api/user`);
  console.log(`\n📅 Тренировки:`);
  console.log(`   GET    /api/trainings`);
  console.log(`   GET    /api/trainings/:id`);
  console.log(`   POST   /api/trainings (admin)`);
  console.log(`   DELETE /api/trainings/:id (admin)`);
  console.log(`\n📝 Записи:`);
  console.log(`   POST   /api/bookings`);
  console.log(`   GET    /api/bookings`);
  console.log(`   DELETE /api/bookings/:id`);
  console.log(`\n📊 Прогресс:`);
  console.log(`   GET    /api/progress`);
  console.log(`   POST   /api/progress`);
  console.log(`\n🎫 Абонементы:`);
  console.log(`   GET    /api/memberships`);
  console.log(`   POST   /api/memberships (admin)`);
  console.log(`\n👑 Администрирование:`);
  console.log(`   GET    /api/admin/users`);
});