'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    setIsAdmin(true)
  }, [router])

  if (!isAdmin) return <div className="container"><div className="card">Проверка прав...</div></div>

  return (
    <div className="container">
      <div style={{ paddingTop: '20px' }}>
        <div className="card">
          <h1>Админ-панель</h1>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
            ← Назад в профиль
          </Link>
          <p>Страница в разработке. Здесь администратор может управлять тренировками и пользователями.</p>
        </div>
      </div>
    </div>
  )
}