'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    href: '/dashboard', label: 'Início',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/eventos', label: 'Eventos',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    href: '/registos', label: 'Registos',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: '/planos', label: 'Planos',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/perfil', label: 'Perfil',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
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
        position: 'fixed', top: 0, left: 0, height: '100vh', width: '220px',
        backgroundColor: '#0a0f0d', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '28px 0', zIndex: 100,
      }} className="desktop-nav">
        <div style={{ padding: '0 20px 36px' }}>
          <span style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '22px', letterSpacing: '0.1em' }}>
            CROSSERS <span style={{ color: 'var(--accent)' }}>HUB</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
          {navItems.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', fontSize: '14px',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--accent)' : 'var(--gray-mid)',
                backgroundColor: active ? 'rgba(76,175,80,0.12)' : 'transparent',
                transition: 'all 0.15s', textDecoration: 'none',
              }}>
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
        <div style={{ padding: '0 12px' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 14px', borderRadius: '10px', fontSize: '14px',
            color: 'var(--gray-mid)', background: 'none', border: 'none',
            width: '100%', cursor: 'pointer',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#0a0f0d', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 0 16px', zIndex: 100,
      }} className="mobile-nav">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              fontSize: '10px', fontWeight: active ? 600 : 400,
              color: active ? 'var(--accent)' : 'var(--gray-mid)',
              padding: '4px 10px', textDecoration: 'none',
            }}>
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) { .mobile-nav { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
      `}</style>
    </>
  )
}
