'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type WeekStat = { semana: string; count: number }

export default function PerfilPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [nome, setNome] = useState('')
  const [genero, setGenero] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [totalRegistos, setTotalRegistos] = useState(0)
  const [totalEventos, setTotalEventos] = useState(0)
  const [weekStats, setWeekStats] = useState<WeekStat[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email ?? '')

      const [profileRes, registosRes, eventosRes] = await Promise.all([
        supabase.from('users').select('nome, genero, data_nascimento, created_at, foto_url').eq('id', user.id).single(),
        supabase.from('personal_records').select('id, data_registo').eq('user_id', user.id),
        supabase.from('event_entries').select('id').eq('user_id', user.id),
      ])

      if (profileRes.data) {
        setCreatedAt(profileRes.data.created_at)
        setNome(profileRes.data.nome)
        setGenero(profileRes.data.genero)
        setDataNascimento(profileRes.data.data_nascimento)
        setFotoUrl(profileRes.data.foto_url)
      }

      setTotalRegistos(registosRes.data?.length ?? 0)
      setTotalEventos(eventosRes.data?.length ?? 0)

      // Build weekly activity for last 8 weeks
      const records = registosRes.data ?? []
      const weeks: Record<string, number> = {}
      for (let i = 7; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i * 7)
        const key = `S${8 - i}`
        weeks[key] = 0
      }
      records.forEach(r => {
        const daysAgo = Math.floor((Date.now() - new Date(r.data_registo).getTime()) / 86400000)
        const weekIdx = Math.floor(daysAgo / 7)
        if (weekIdx < 8) {
          const key = `S${8 - weekIdx}`
          if (weeks[key] !== undefined) weeks[key]++
        }
      })
      setWeekStats(Object.entries(weeks).map(([semana, count]) => ({ semana, count })))
      setLoaded(true)
    }
    load()
  }, [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadErr) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('users').update({ foto_url: data.publicUrl }).eq('id', userId)
      setFotoUrl(data.publicUrl + '?t=' + Date.now())
    }
    setUploadingPhoto(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setLoading(true)
    const { error: err } = await supabase.from('users').update({ nome, genero, data_nascimento: dataNascimento }).eq('id', userId)
    setLoading(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const maxCount = Math.max(...weekStats.map(w => w.count), 1)

  if (!loaded) return <div style={{ color: 'var(--gray-mid)', padding: '40px' }}>A carregar...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>

      {/* Avatar + nome + stats */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: fotoUrl ? 'transparent' : 'rgba(76,175,80,0.15)',
              border: '2px solid var(--accent)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {fotoUrl
                ? <img src={fotoUrl} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '32px' }}>👤</span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '12px',
              }}
            >
              {uploadingPhoto ? '⏳' : '📷'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </div>

          {/* Nome e info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '26px', lineHeight: 1 }}>{nome}</h2>
            <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginTop: '2px' }}>{email}</p>
            <p style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '4px' }}>
              Membro desde {new Date(createdAt).toLocaleDateString('pt-PT')}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {[
            { value: totalRegistos, label: 'Registos' },
            { value: totalEventos, label: 'Eventos' },
            { value: genero === 'M' ? 'M' : 'F', label: 'Género' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg)', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico actividade */}
      {weekStats.some(w => w.count > 0) && (
        <div className="card">
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Actividade — últimas 8 semanas
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
            {weekStats.map(w => (
              <div key={w.semana} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${Math.max((w.count / maxCount) * 100, w.count > 0 ? 8 : 4)}%`,
                  background: w.count > 0 ? 'var(--accent)' : 'var(--border)',
                  borderRadius: '4px',
                  minHeight: '4px',
                  opacity: w.count > 0 ? 1 : 0.4,
                  transition: 'height 0.3s',
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {weekStats.map(w => (
              <div key={w.semana} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: 'var(--gray-mid)' }}>{w.semana}</div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário edição */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Editar Dados
          </p>
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
                <button key={g} type="button" onClick={() => setGenero(g)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: `1px solid ${genero === g ? 'var(--accent)' : 'var(--border)'}`,
                  background: genero === g ? 'rgba(76,175,80,0.1)' : 'transparent',
                  color: genero === g ? 'var(--accent)' : 'var(--white)',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {g === 'M' ? 'Masculino' : 'Feminino'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}
        {saved && <p style={{ color: 'var(--accent)', fontSize: '14px' }}>✓ Perfil actualizado.</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </form>
    </div>
  )
}
