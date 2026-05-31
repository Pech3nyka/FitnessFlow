'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    weight: '',
    height: '',
    goal: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:5000/api/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          fullName: data.fullName || '',
          weight: data.weight || '',
          height: data.height || '',
          goal: data.goal || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseInt(formData.height) : null,
          goal: formData.goal || null
        })
      });

      if (!res.ok) throw new Error('Ошибка при сохранении');

      setMessage({ text: '✅ Профиль обновлён!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      
      // Обновляем данные в localStorage
      const userRes = await fetch('http://localhost:5000/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (err: any) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container"><div className="card">Загрузка...</div></div>;

  return (
    <div className="container">
      <div style={{ paddingTop: '20px' }}>
        <div className="card">
          <h1>✏️ Редактирование профиля</h1>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
            ← Назад в профиль
          </Link>

          {message && (
            <div className={message.type === 'success' ? 'success' : 'error'} style={{ marginBottom: '16px' }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Полное имя</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Вес (кг)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input"
                placeholder="например: 75.5"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Рост (см)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="input"
                placeholder="например: 175"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Цель тренировок</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="input"
              >
                <option value="">Выберите цель</option>
                <option value="Похудение">Похудение</option>
                <option value="Набор массы">Набор массы</option>
                <option value="Поддержание формы">Поддержание формы</option>
                <option value="Здоровье">Здоровье</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}