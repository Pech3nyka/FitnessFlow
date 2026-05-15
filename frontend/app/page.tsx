import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="text-center" style={{ paddingTop: '100px' }}>
        <div className="card">
          <h1>FitnessFlow</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
            Ваш персональный фитнес-помощник
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary">
              Войти
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}