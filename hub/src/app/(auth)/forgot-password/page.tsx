'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '28px', marginBottom: '12px' }}>
          EMAIL ENVIADO
        </h2>
        <p style={{ color: 'var(--gray-light)', fontSize: '14px', marginBottom: '24px' }}>
          Verifica o teu email e clica no link para redefinir a password.
        </p>
        <Link href="/login" style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 600 }}>
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '28px', marginBottom: '8px' }}>
        RECUPERAR PASSWORD
      </h2>
      <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginBottom: '24px' }}>
        Indica o teu email e enviamos um link para redefinires a password.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'A enviar...' : 'Enviar link'}
        </button>
      </form>
      <p style={{ marginTop: '20px', color: 'var(--gray-mid)', fontSize: '13px', textAlign: 'center' }}>
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
