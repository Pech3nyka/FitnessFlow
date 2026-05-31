import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'FitnessFlow',
  description: 'Веб-приложение для автоматизации работы фитнес-клуба',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        {/* ШАПКА САЙТА */}
        <header style={{ 
          backgroundColor: '#1e293b', 
          color: 'white', 
          padding: '16px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Логотип и название */}
            <Link href="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: 'white', 
              textDecoration: 'none' 
            }}>
              <span style={{ fontSize: '28px' }}>🏋️</span>
              <span>FitnessFlow</span>
            </Link>
            
            {/* Навигация */}
            <nav style={{ display: 'flex', gap: '24px' }}>
              <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                Главная
              </Link>
              <Link href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                Личный кабинет
              </Link>
            </nav>
          </div>
        </header>
        
        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main>{children}</main>
      </body>
    </html>
  );
}