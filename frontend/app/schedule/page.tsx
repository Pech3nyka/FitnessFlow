'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Training {
  id: string
  name: string
  trainer: string
  date: string
  time: string
  duration: number
  capacity: number
  level: string
  availableSeats?: number
}

interface Booking {
  id: string
  trainingId: string
  status: string
}

export default function SchedulePage() {
  const router = useRouter()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [bookedTrainings, setBookedTrainings] = useState<Set<string>>(new Set())

  const loadTrainings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trainings')
      const data = await res.json()
      setTrainings(data)
      
      // Загружаем записи пользователя
      const token = localStorage.getItem('token')
      if (token) {
        const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (bookingsRes.ok) {
          const bookings: Booking[] = await bookingsRes.json()
          const bookedIds = new Set<string>(bookings.map((b: Booking) => b.trainingId))
          setBookedTrainings(bookedIds)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrainings()
  }, [])

  const handleBooking = async (trainingId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trainingId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при записи')
      }

      setMessage({ text: '✅ Вы успешно записаны на тренировку!', type: 'success' })
      loadTrainings() // Обновляем список
      
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (loading) return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>Загрузка...</div>
    </div>
  )

  return (
    <div className="container">
      <div style={{ paddingTop: '20px' }}>
        <div className="card">
          <h1>📅 Расписание тренировок</h1>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
            ← Назад в профиль
          </Link>

          {message && (
            <div className={message.type === 'success' ? 'success' : 'error'} style={{ marginBottom: '16px' }}>
              {message.text}
            </div>
          )}
          
          {trainings.length === 0 ? (
            <p>Нет доступных тренировок</p>
          ) : (
            trainings.map((training) => {
              const isBooked = bookedTrainings.has(training.id)
              const availableSeats = training.availableSeats ?? training.capacity
              
              return (
                <div key={training.id} className="card" style={{ marginBottom: '16px' }}>
                  <h3>{training.name}</h3>
                  <p><strong>🧘 Тренер:</strong> {training.trainer}</p>
                  <p><strong>📅 Дата:</strong> {new Date(training.date).toLocaleDateString()}</p>
                  <p><strong>⏰ Время:</strong> {training.time}</p>
                  <p><strong>⏱️ Длительность:</strong> {training.duration} мин</p>
                  <p><strong>📊 Уровень:</strong> {training.level}</p>
                  <p><strong>🪑 Свободных мест:</strong> {availableSeats}</p>
                  
                  {isBooked ? (
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.6 }}>
                      ✅ Вы уже записаны
                    </button>
                  ) : availableSeats > 0 ? (
                    <button 
                      onClick={() => handleBooking(training.id)} 
                      className="btn btn-primary"
                      style={{ marginTop: '10px', cursor: 'pointer' }}
                    >
                      📝 Записаться
                    </button>
                  ) : (
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.6 }}>
                      ❌ Нет мест
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}