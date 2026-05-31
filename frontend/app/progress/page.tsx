'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProgressRecord {
  id: string;
  date: string;
  weight: number;
  bodyFat: number | null;
  notes: string | null;
}

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    notes: ''
  });

  const loadProgress = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/progress', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const dataToSend = {
      date: formData.date,
      weight: parseFloat(formData.weight),
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
      notes: formData.notes || null
    };

    try {
      const res = await fetch('http://localhost:5000/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) throw new Error('Ошибка при добавлении');

      setMessage({ text: '✅ Запись добавлена!', type: 'success' });
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        notes: ''
      });
      loadProgress();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Функция удаления записи прогресса
  const handleDeleteProgress = async (id: string) => {
    if (!confirm('Удалить эту запись?')) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/progress/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Ошибка при удалении');

      setMessage({ text: '✅ Запись удалена!', type: 'success' });
      loadProgress();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <h1>📊 Мой прогресс</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? 'Отмена' : '+ Добавить запись'}
            </button>
          </div>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
            ← Назад в профиль
          </Link>

          {message && (
            <div className={message.type === 'success' ? 'success' : 'error'} style={{ marginBottom: '16px' }}>
              {message.text}
            </div>
          )}

          {/* Форма добавления */}
          {showForm && (
            <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
              <h3>➕ Новая запись</h3>
              <form onSubmit={handleAddProgress}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold' }}>Дата</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold' }}>Вес (кг)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input"
                    placeholder="например: 75.5"
                    required
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold' }}>Процент жира (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                    className="input"
                    placeholder="необязательно"
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold' }}>Заметки</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="Что получилось? Как самочувствие?"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#22c55e' }}>
                  Сохранить
                </button>
              </form>
            </div>
          )}

          {/* Таблица с прогрессом */}
          {progress.length === 0 ? (
            <p>Пока нет записей о прогрессе. Добавьте первую!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>Дата</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>Вес (кг)</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>Жир (%)</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd' }}>Заметки</th>
                  <th style={{ textAlign: 'center', padding: '8px', borderBottom: '2px solid #ddd' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((record) => (
                  <tr key={record.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{record.weight}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{record.bodyFat ?? '—'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{record.notes || '—'}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteProgress(record.id)}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}