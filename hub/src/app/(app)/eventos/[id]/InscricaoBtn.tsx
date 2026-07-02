'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InscricaoBtn({
  eventoId,
  inscrito,
  entryId,
}: {
  eventoId: string
  inscrito: boolean
  entryId: string | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  async function handleInscrever() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('event_entries').insert({
      event_id: eventoId,
      user_id: user!.id,
      resultado: null,
    })
    setLoading(false)
    router.refresh()
  }

  async function handleCancelar() {
    if (!entryId) return
    setLoading(true)
    await supabase.from('event_entries').delete().eq('id', entryId)
    setLoading(false)
    setConfirmar(false)
    router.refresh()
  }

  if (inscrito) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: '10px', padding: '10px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>Inscrito</span>
        </div>
        {!confirmar ? (
          <button onClick={() => setConfirmar(true)} style={{
            background: 'none', border: 'none', color: 'var(--gray-mid)', fontSize: '13px',
            cursor: 'pointer', textDecoration: 'underline', padding: 0,
          }}>
            Cancelar inscrição
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>Tens a certeza?</span>
            <button onClick={handleCancelar} disabled={loading} style={{
              background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171',
              fontSize: '13px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            }}>
              {loading ? '...' : 'Sim, cancelar'}
            </button>
            <button onClick={() => setConfirmar(false)} style={{
              background: 'none', border: 'none', color: 'var(--gray-mid)', fontSize: '13px', cursor: 'pointer',
            }}>
              Não
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button onClick={handleInscrever} disabled={loading} className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
      {loading ? 'A inscrever...' : 'Inscrever-me'}
    </button>
  )
}
