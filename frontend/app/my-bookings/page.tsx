'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Training {
  id: string;
  name: string;
  trainer: string;
  date: string;
  time: string;
  duration: number;
}

interface Booking {
  id: string;
  trainingId: string;
  status: string;
  bookedAt: string;
  training?: Training;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Получение списка пользователей
      const res = await fetch('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Ошибка загрузки');
      
      const data = await res.json();
      
      // Детали каждой тренировки
      const bookingsWithTrainings = await Promise.all(
        data.map(async (booking: Booking) => {
          try {
            const trainingRes = await fetch(`http://localhost:5000/api/trainings/${booking.trainingId}`);
            const training = await trainingRes.json();
            return { ...booking, training };
          } catch {
            return { ...booking, training: undefined };
          }
        })
      );
      
      setBookings(bookingsWithTrainings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string, trainingName: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm(`Отменить запись на "${trainingName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Ошибка при отмене');
      }

      setMessage({ text: '✅ Запись успешно отменена', type: 'success' });
      loadBookings(); // Обновляем список
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  useEffect(() => {
    loadBookings();
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
          <h1>📋 Мои записи на тренировки</h1>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
            ← Назад в профиль
          </Link>

          {message && (
            <div className={message.type === 'success' ? 'success' : 'error'} style={{ marginBottom: '16px' }}>
              {message.text}
            </div>
          )}

          {bookings.length === 0 ? (
            <p>
              У вас пока нет записей на тренировки. 
              Перейдите в <Link href="/schedule">расписание</Link>, чтобы записаться.
            </p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="card" style={{ marginBottom: '16px' }}>
                <h3>{booking.training?.name || 'Тренировка'}</h3>
                {booking.training ? (
                  <>
                    <p><strong>🧘 Тренер:</strong> {booking.training.trainer}</p>
                    <p><strong>📅 Дата:</strong> {new Date(booking.training.date).toLocaleDateString()}</p>
                    <p><strong>⏰ Время:</strong> {booking.training.time}</p>
                    <p><strong>⏱️ Длительность:</strong> {booking.training.duration} мин</p>
                  </>
                ) : (
                  <p style={{ color: '#999' }}>Информация о тренировке недоступна</p>
                )}
                <p><strong>📅 Записано:</strong> {new Date(booking.bookedAt).toLocaleString()}</p>
                <button 
                  onClick={() => handleCancel(booking.id, booking.training?.name || 'тренировку')}
                  className="btn btn-secondary"
                  style={{ marginTop: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  ❌ Отменить запись
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}