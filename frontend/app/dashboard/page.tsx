'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [trainings, setTrainings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Загрузка расписания
    fetch('http://localhost:5000/api/trainings')
      .then(res => res.json())
      .then(data => setTrainings(data))
      .catch(err => console.error('Ошибка загрузки расписания:', err))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ paddingTop: '100px' }}>
          <div className="card">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ paddingTop: '20px' }}>
        {/* КАРТОЧКА ПРОФИЛЯ с кнопкой редактирования */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <h1>Личный кабинет</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/profile/edit" className="btn btn-secondary" style={{ fontSize: '14px' }}>
                ✏️ Редактировать профиль
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ backgroundColor: '#dc2626', color: 'white' }}>
                Выйти
              </button>
            </div>
          </div>
          
          {user && (
            <div style={{ marginTop: '20px' }}>
              <p><strong>Имя:</strong> {user.fullName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Клиент'}</p>
              {user.weight && <p><strong>Вес:</strong> {user.weight} кг</p>}
              {user.height && <p><strong>Рост:</strong> {user.height} см</p>}
              {user.goal && <p><strong>Цель:</strong> {user.goal}</p>}
            </div>
          )}
        </div>

        {/* БЛИЖАЙШИЕ ТРЕНИРОВКИ */}
        <div className="card">
          <h2>Ближайшие тренировки</h2>
          {trainings.length === 0 ? (
            <p>Нет доступных тренировок</p>
          ) : (
            <div>
              {trainings.map((training: any) => (
                <div key={training.id} style={{ 
                  borderBottom: '1px solid #eee', 
                  padding: '10px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{training.name}</strong>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      {training.trainer} | {new Date(training.date).toLocaleDateString()} {training.time}
                    </p>
                  </div>
                  <Link href={`/schedule`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '14px' }}>
                    Записаться
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* НАВИГАЦИЯ */}
        <div className="card">
          <h2>Навигация</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/memberships" className="btn btn-primary">🎫 Абонементы</Link>
            <Link href="/schedule" className="btn btn-primary">📅 Расписание</Link>
            <Link href="/progress" className="btn btn-primary">📊 Мой прогресс</Link>
            <Link href="/my-bookings" className="btn btn-primary">📋 Мои записи</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="btn btn-primary">👑 Админ-панель</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}