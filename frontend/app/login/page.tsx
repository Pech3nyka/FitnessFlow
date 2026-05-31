'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Вход в систему
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при входе');
      }

      // 2. Сохраняем токен
      localStorage.setItem('token', data.token);
      
      // 3. Загружаем ПОЛНЫЕ данные пользователя (с весом, ростом, целью)
      const userRes = await fetch('http://localhost:5000/api/user', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const fullUserData = await userRes.json();
      localStorage.setItem('user', JSON.stringify(fullUserData));
      
      console.log('Сохранён пользователь:', fullUserData);

      // 4. Перенаправление
      if (fullUserData.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="text-center" style={{ paddingTop: '80px', maxWidth: '400px', margin: '0 auto' }}>
        <div className="card">
          <h1>Вход в FitnessFlow</h1>
          
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="Email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <input
                type="password"
                placeholder="Пароль"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <p style={{ marginTop: '16px', fontSize: '0.9rem' }}>
            Нет аккаунта? <Link href="/register" style={{ color: '#3b82f6' }}>Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
}