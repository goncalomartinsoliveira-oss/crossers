'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Entry = { id: string; resultado: number | null }

export default function SubmitResultForm({
  eventoId,
  unidade,
  minhaEntry,
}: {
  eventoId: string
  unidade: string
  minhaEntry: Entry | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [resultado, setResultado] = useState(minhaEntry?.resultado ? String(minhaEntry.resultado) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const valor = parseFloat(resultado)

    if (minhaEntry) {
      const { error: err } = await supabase
        .from('event_entries')
        .update({ resultado: valor })
        .eq('id', minhaEntry.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: err } = await supabase
        .from('event_entries')
        .insert({ event_id: eventoId, user_id: user!.id, resultado: valor })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const placeholder = unidade === 'tempo' ? 'ex: 180 (= 3 min)' : unidade === 'distancia' ? 'ex: 5000 (= 5km)' : 'ex: 20'
  const label = unidade === 'tempo' ? 'segundos' : unidade === 'distancia' ? 'metros' : 'repetições'
  const temResultado = minhaEntry?.resultado != null

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '20px' }}>
        {temResultado ? 'ACTUALIZAR RESULTADO' : 'SUBMETER RESULTADO'}
      </h3>
      {temResultado && (
        <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginTop: '-6px' }}>
          Resultado actual: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{minhaEntry!.resultado} {label}</span>
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="label">Resultado ({label})</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={resultado}
            onChange={e => setResultado(e.target.value)}
            placeholder={placeholder}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '10px 24px', flexShrink: 0 }}>
          {loading ? '...' : temResultado ? 'Actualizar' : 'Submeter'}
        </button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {saved && <p style={{ color: 'var(--accent)', fontSize: '13px' }}>✓ Resultado guardado!</p>}
    </div>
  )
}
