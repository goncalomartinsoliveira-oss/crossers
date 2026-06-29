'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/eventos', label: 'Eventos', icon: '🏆' },
  { href: '/registos', label: 'Registos', icon: '📊' },
  { href: '/planos', label: 'Planos', icon: '📋' },
  { href: '/perfil', label: 'Perfil', icon: '👤' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '220px',
        backgroundColor: '#111111',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        zIndex: 100,
      }} className="desktop-nav">
        <div style={{ padding: '0 20px 32px' }}>
          <span style={{
            fontFamily: 'var(--font-bebas), sans-serif',
            fontSize: '22px',
            letterSpacing: '0.1em',
          }}>
            CROSSERS <span style={{ color: 'var(--accent)' }}>HUB</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          {navItems.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--accent)' : 'var(--gray-light)',
                backgroundColor: active ? 'rgba(76,175,80,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
        <div style={{ padding: '0 12px' }}>
          <button onClick={handleLogout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--gray-mid)',
            background: 'none',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
          }}>
            <span>🚪</span> Sair
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111111',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 12px',
        zIndex: 100,
      }} className="mobile-nav">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--accent)' : 'var(--gray-mid)',
              padding: '4px 8px',
            }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
