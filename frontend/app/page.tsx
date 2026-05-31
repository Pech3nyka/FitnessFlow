'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <div className="card">Загрузка...</div>
      </div>
    );
  }

  return (
    <div>
      {/* ГЕРОЙ СЕКЦИЯ */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            🏋️ FitnessFlow
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '30px', opacity: 0.95 }}>
            Ваш персональный фитнес-помощник
          </p>
          <p style={{ fontSize: '18px', marginBottom: '40px', opacity: 0.85 }}>
            Автоматизация работы фитнес-клуба: запись на тренировки, 
            отслеживание прогресса, управление абонементами
          </p>
          {!isAuthenticated ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link href="/login" className="btn btn-primary" style={{ fontSize: '18px', padding: '12px 32px' }}>
                Войти
              </Link>
              <Link href="/register" className="btn btn-secondary" style={{ fontSize: '18px', padding: '12px 32px', backgroundColor: 'white', color: '#667eea' }}>
                Регистрация
              </Link>
            </div>
          ) : (
            <Link href={userRole === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary" style={{ fontSize: '18px', padding: '12px 32px' }}>
              Перейти в личный кабинет →
            </Link>
          )}
        </div>
      </div>

      {/* ПРЕИМУЩЕСТВА */}
      <div style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '40px' }}>Почему FitnessFlow?</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '30px'
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3>Расписание тренировок</h3>
              <p>Просматривайте актуальное расписание и записывайтесь на занятия в один клик</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3>Отслеживание прогресса</h3>
              <p>Ведите дневник тренировок, фиксируйте вес и достижения</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
              <h3>Управление абонементами</h3>
              <p>Покупайте абонементы и следите за их статусом</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👑</div>
              <h3>Админ-панель</h3>
              <p>Управляйте тренировками и абонементами через удобную панель</p>
            </div>
          </div>
        </div>
      </div>

      {/* ПРИЗЫВ К ДЕЙСТВИЮ */}
      {!isAuthenticated && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Готовы начать?</h2>
            <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
              Зарегистрируйтесь и начните свой путь к здоровому образу жизни
            </p>
            <Link href="/register" className="btn btn-primary" style={{ fontSize: '16px', padding: '10px 24px' }}>
              Зарегистрироваться →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}