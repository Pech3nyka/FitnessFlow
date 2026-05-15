'use client'

import Link from 'next/link'

export default function ProgressPage() {
  return (
    <div className="container">
      <div style={{ paddingTop: '20px' }}>
        <div className="card">
          <h1>Мой прогресс</h1>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block' }}>
            ← Назад в профиль
          </Link>
          <p>Страница в разработке. Здесь будет отображаться ваш прогресс тренировок.</p>
        </div>
      </div>
    </div>
  )
}