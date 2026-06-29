'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('As passwords não coincidem.')
      return
    }
    if (password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="card">
      <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '28px', marginBottom: '8px' }}>
        CRIAR CONTA
      </h2>
      <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginBottom: '24px' }}>
        Grátis. Sem subscrição.
      </p>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Confirmar Password</label>
          <input
            type="password"
            placeholder="Repete a password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'A criar conta...' : 'Criar Conta'}
        </button>
      </form>
      <p style={{ marginTop: '20px', color: 'var(--gray-mid)', fontSize: '13px', textAlign: 'center' }}>
        Já tens conta?{' '}
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          Entrar
        </Link>
      </p>
    </div>
  )
}
