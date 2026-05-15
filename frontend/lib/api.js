import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Регистрация
export const register = (userData) => api.post('/register', userData);

// Вход
export const login = (userData) => api.post('/login', userData);

// Получение расписания
export const getTrainings = () => api.get('/trainings');

// Создание тренировки (только админ)
export const createTraining = (trainingData) => api.post('/trainings', trainingData);

// Запись на тренировку
export const bookTraining = (trainingId) => api.post('/bookings', { trainingId });

// Получение записей пользователя
export const getUserBookings = () => api.get('/bookings');

// Получение профиля пользователя
export const getUserProfile = () => api.get('/user');

// Обновление профиля
export const updateUserProfile = (userData) => api.put('/user', userData);

// Получение прогресса
export const getProgress = () => api.get('/progress');

// Добавление записи прогресса
export const addProgress = (progressData) => api.post('/progress', progressData);

// Админ: получение всех пользователей
export const getAllUsers = () => api.get('/admin/users');

export default api;