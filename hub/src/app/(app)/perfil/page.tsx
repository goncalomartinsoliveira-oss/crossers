'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PerfilPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [nome, setNome] = useState('')
  const [genero, setGenero] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('users')
        .select('nome, genero, data_nascimento, created_at')
        .eq('id', user!.id)
        .single()
      if (data) {
        setEmail(user!.email ?? '')
        setCreatedAt(data.created_at)
        setNome(data.nome)
        setGenero(data.genero)
        setDataNascimento(data.data_nascimento)
        setLoaded(true)
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase
      .from('users')
      .update({ nome, genero, data_nascimento: dataNascimento })
      .eq('id', user!.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!loaded) return <div style={{ color: 'var(--gray-mid)', padding: '40px' }}>A carregar...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '560px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '40px', lineHeight: 1.1 }}>
          O MEU <span style={{ color: 'var(--accent)' }}>PERFIL</span>
        </h1>
        <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginTop: '4px' }}>
          Membro desde {new Date(createdAt).toLocaleDateString('pt-PT')}
        </p>
      </div>

      <div className="card">
        <span className="label">Email</span>
        <p style={{ fontSize: '15px', color: 'var(--gray-light)' }}>{email}</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="label">Nome completo</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div>
            <label className="label">Data de nascimento</label>
            <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required />
          </div>

          <div>
            <label className="label">Género</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['M', 'F'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenero(g)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${genero === g ? 'var(--accent)' : 'var(--border)'}`,
                    background: genero === g ? 'rgba(76,175,80,0.1)' : 'transparent',
                    color: genero === g ? 'var(--accent)' : 'var(--white)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {g === 'M' ? 'Masculino' : 'Feminino'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}
        {saved && <p style={{ color: 'var(--accent)', fontSize: '14px' }}>✓ Perfil actualizado com sucesso.</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </form>
    </div>
  )
}
