'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Training {
  id: string;
  name: string;
  description: string;
  trainer: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  level: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Форма добавления тренировки
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trainer: '',
    date: '',
    time: '',
    duration: 60,
    capacity: 15,
    level: 'Начинающий'
  });

  // Проверка прав администратора
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    setIsAdmin(true);
    loadTrainings();
  }, []);

  // Загрузка списка тренировок
  const loadTrainings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trainings');
      const data = await res.json();
      setTrainings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Создание тренировки
  const handleCreateTraining = async (e: React.FormEvent) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  
  if (!token) {
    setMessage({ text: '❌ Не авторизован. Войдите заново.', type: 'error' });
    return;
  }
  
  // Подготовка данных
  const trainingData = {
    name: formData.name,
    description: formData.description || '',
    trainer: formData.trainer,
    date: formData.date,
    time: formData.time,
    duration: Number(formData.duration),
    capacity: Number(formData.capacity),
    level: formData.level
  };
  
  console.log('Отправка:', trainingData);
  
  try {
    const res = await fetch('http://localhost:5000/api/trainings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(trainingData)
    });

    const responseData = await res.json();
    console.log('Ответ:', responseData);

    if (!res.ok) {
      throw new Error(responseData.error || 'Ошибка при создании');
    }

    setMessage({ text: '✅ Тренировка успешно создана!', type: 'success' });
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      trainer: '',
      date: '',
      time: '',
      duration: 60,
      capacity: 15,
      level: 'Начинающий'
    });
    loadTrainings(); // Обновляем список
    setTimeout(() => setMessage(null), 3000);
  } catch (err: any) {
    console.error('Ошибка:', err);
    setMessage({ text: `❌ ${err.message}`, type: 'error' });
    setTimeout(() => setMessage(null), 3000);
  }
};

  // Удаление тренировки
  const handleDeleteTraining = async (id: string, name: string) => {
    if (!confirm(`Удалить тренировку "${name}"? Все записи на неё также будут удалены.`)) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`http://localhost:5000/api/trainings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Ошибка при удалении');
      }

      setMessage({ text: '✅ Тренировка удалена', type: 'success' });
      loadTrainings();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ paddingTop: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h1>👑 Админ-панель</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="btn btn-primary"
                style={{ backgroundColor: '#22c55e' }}
              >
                {showForm ? '❌ Отменить' : '+ Добавить тренировку'}
              </button>
              <Link href="/dashboard" className="btn btn-secondary">
                ← Назад в профиль
              </Link>
            </div>
          </div>

          {message && (
            <div className={message.type === 'success' ? 'success' : 'error'} style={{ marginBottom: '16px' }}>
              {message.text}
            </div>
          )}

          {/* Форма добавления тренировки */}
          {showForm && (
            <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
              <h2>➕ Новая тренировка</h2>
              <form onSubmit={handleCreateTraining}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Название *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input" required />
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Описание</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="input" rows={3} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Тренер *</label>
                    <input type="text" name="trainer" value={formData.trainer} onChange={handleInputChange} className="input" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Уровень</label>
                    <select name="level" value={formData.level} onChange={handleInputChange} className="input">
                      <option>Начинающий</option>
                      <option>Средний</option>
                      <option>Продвинутый</option>
                      <option>Любой</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Дата *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="input" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Время *</label>
                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="input" required />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Длительность (мин)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} className="input" min={15} max={180} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Макс. участников</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="input" min={1} max={50} />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#22c55e' }}>
                  Создать тренировку
                </button>
              </form>
            </div>
          )}

          {/* Список тренировок */}
          <h2>📋 Список тренировок</h2>
          {trainings.length === 0 ? (
            <p>Нет тренировок. Добавьте первую!</p>
          ) : (
            trainings.map((training) => (
              <div key={training.id} className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <h3>{training.name}</h3>
                    <p><strong>🧘 Тренер:</strong> {training.trainer}</p>
                    <p><strong>📅 Дата:</strong> {new Date(training.date).toLocaleDateString()} в {training.time}</p>
                    <p><strong>⏱️ Длительность:</strong> {training.duration} мин | <strong>📊 Уровень:</strong> {training.level}</p>
                    <p><strong>🪑 Вместимость:</strong> {training.capacity} мест</p>
                    {training.description && (
                      <p><strong>📝 Описание:</strong> {training.description}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteTraining(training.id, training.name)}
                    className="btn btn-secondary"
                    style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 16px' }}
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}