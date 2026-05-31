'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Membership {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export default function MembershipsPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userMembership, setUserMembership] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadMemberships();
    loadUserMembership();
  }, []);

  const loadMemberships = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/memberships');
      const data = await res.json();
      setMemberships(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUserMembership = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/user/memberships/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserMembership(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (membershipId: string, name: string, price: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm(`Купить абонемент "${name}" за ${price} руб.?`)) return;

    try {
      const res = await fetch('http://localhost:5000/api/user/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ membershipId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при покупке');
      }

      setMessage({ text: `✅ Абонемент "${name}" успешно куплен!`, type: 'success' });
      
      // Обновление информации об абонементе
      await loadUserMembership();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

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
          <h1>🎫 Абонементы FitnessFlow</h1>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
            ← Назад в профиль
          </Link>

          {message && (
            <div className={message.type === 'success' ? 'success' : 'error'} style={{ marginBottom: '16px' }}>
              {message.text}
            </div>
          )}

          {/* Отображение активного абонемента */}
          {userMembership ? (
            <div className="card" style={{ backgroundColor: '#e6f7ff', marginBottom: '20px' }}>
              <p><strong>✅ Ваш активный абонемент:</strong></p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
                {userMembership.membership?.name}
              </p>
              <p>Действует до: {new Date(userMembership.endDate).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="card" style={{ backgroundColor: '#fff3e6', marginBottom: '20px' }}>
              <p><strong>⚠️ У вас нет активного абонемента</strong></p>
              <p>Выберите один из абонементов ниже, чтобы посещать тренировки.</p>
            </div>
          )}

          <h2>📋 Доступные абонементы</h2>
          {memberships.length === 0 ? (
            <p>Нет доступных абонементов</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {memberships.map((membership) => (
                <div key={membership.id} className="card" style={{ textAlign: 'center' }}>
                  <h3>{membership.name}</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
                    {membership.price} ₽
                  </p>
                  <p>📅 {membership.durationDays} дней</p>
                  <button 
                    onClick={() => handlePurchase(membership.id, membership.name, membership.price)}
                    className="btn btn-primary"
                    style={{ marginTop: '16px', width: '100%' }}
                  >
                    Купить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}