'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [genero, setGenero] = useState<'M' | 'F' | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!genero) {
      setError('Seleciona o teu género.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('users').insert({
      id: user.id,
      nome,
      data_nascimento: dataNascimento,
      genero,
    })

    if (error) {
      setError('Erro ao guardar o perfil. Tenta novamente.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card">
      <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '28px', marginBottom: '8px' }}>
        COMPLETA O TEU PERFIL
      </h2>
      <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginBottom: '24px' }}>
        Só precisamos de mais alguns dados para personalizar a tua experiência.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="label">Nome completo</label>
          <input
            type="text"
            placeholder="O teu nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Data de nascimento</label>
          <input
            type="date"
            value={dataNascimento}
            onChange={e => setDataNascimento(e.target.value)}
            required
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label className="label">Género</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {(['M', 'F'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGenero(g)}
                style={{
                  padding: '14px',
                  borderRadius: '6px',
                  border: `2px solid ${genero === g ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: genero === g ? 'rgba(76,175,80,0.1)' : 'var(--bg-input)',
                  color: genero === g ? 'var(--accent)' : 'var(--gray-light)',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                {g === 'M' ? 'Masculino' : 'Feminino'}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading || !genero}>
          {loading ? 'A guardar...' : 'Entrar no Hub'}
        </button>
      </form>
    </div>
  )
}
