'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Entry = { id: string; resultado: number }

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
  const [resultado, setResultado] = useState(minhaEntry ? String(minhaEntry.resultado) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const valor = parseFloat(resultado)

    if (minhaEntry) {
      const { error: err } = await supabase
        .from('event_entries')
        .update({ resultado: valor })
        .eq('id', minhaEntry.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase
        .from('event_entries')
        .insert({ event_id: eventoId, user_id: user!.id, resultado: valor })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setLoading(false)
    router.refresh()
  }

  const placeholder = unidade === 'tempo' ? 'ex: 180 (= 3 min)' : unidade === 'distancia' ? 'ex: 5000 (= 5km)' : 'ex: 20'
  const label = unidade === 'tempo' ? 'segundos' : unidade === 'distancia' ? 'metros' : 'repetições'

  return (
    <div className="card">
      <h3 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '20px', marginBottom: '16px' }}>
        {minhaEntry ? 'ACTUALIZAR RESULTADO' : 'SUBMETER RESULTADO'}
      </h3>
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
          {loading ? '...' : minhaEntry ? 'Actualizar' : 'Submeter'}
        </button>
      </form>
      {error && <p className="error-msg" style={{ marginTop: '8px' }}>{error}</p>}
      {minhaEntry && (
        <p style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '8px' }}>
          Resultado actual: {minhaEntry.resultado} {label}
        </p>
      )}
    </div>
  )
}
