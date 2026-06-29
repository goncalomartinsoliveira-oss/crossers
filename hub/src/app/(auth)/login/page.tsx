'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou password incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card">
      <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '28px', marginBottom: '24px' }}>
        ENTRAR
      </h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="o.teu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
        <Link href="/forgot-password" style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>
          Esqueceste a password?
        </Link>
        <p style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>
          Não tens conta?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Regista-te
          </Link>
        </p>
      </div>
    </div>
  )
}
