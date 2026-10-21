'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Resultado = {
  id: string
  edicao_id: string
  dorsal: string
  categoria: string | null
  escalao: string | null
  equipa_clube: string | null
  nome_atleta: string
  status: string
  tempo_total_segundos: number | null
  posicao_geral_genero: number | null
  posicao_categoria: number | null
  edicao_nome?: string
  edicao_local?: string | null
  edicao_data?: string | null
  colega_nome?: string | null
}

type CandidatoBusca = {
  id: string
  dorsal: string
  nome_atleta: string
  categoria: string | null
  edicao_nome: string
}

function formatTempo(segundos: number | null): string {
  if (segundos == null) return '—'
  const h = Math.floor(segundos / 3600)
  const m = Math.round((segundos % 3600) / 60)
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`
}

export default function HistoricoResultados() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [busca, setBusca] = useState('')
  const [candidatos, setCandidatos] = useState<CandidatoBusca[]>([])
  const [buscando, setBuscando] = useState(false)
  const [aClaimar, setAClaimar] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // tenta associação automática por email, só para resultados ainda por reclamar
    if (user.email) {
      await supabase
        .from('race_results')
        .update({ user_id: user.id, claimed_at: new Date().toISOString() })
        .is('user_id', null)
        .ilike('email_atleta', user.email)
    }

    const { data: meus } = await supabase
      .from('race_results')
      .select('id, edicao_id, dorsal, categoria, escalao, equipa_clube, nome_atleta, status, tempo_total_segundos, posicao_geral_genero, posicao_categoria')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const lista = meus ?? []

    if (lista.length > 0) {
      const edicaoIds = [...new Set(lista.map(r => r.edicao_id))]
      const { data: edicoes } = await supabase
        .from('race_editions')
        .select('id, nome, local, data')
        .in('id', edicaoIds)
      const edicaoMap: Record<string, { nome: string; local: string | null; data: string | null }> = {}
      edicoes?.forEach(e => { edicaoMap[e.id] = e })

      // busca o/a colega de equipa (mesmo dorsal + edição, linha diferente)
      const { data: todasLinhasDasEquipas } = await supabase
        .from('race_results')
        .select('id, edicao_id, dorsal, nome_atleta')
        .in('edicao_id', edicaoIds)
        .in('dorsal', [...new Set(lista.map(r => r.dorsal))])

      const enriquecidos: Resultado[] = lista.map(r => {
        const colega = todasLinhasDasEquipas?.find(
          x => x.edicao_id === r.edicao_id && x.dorsal === r.dorsal && x.id !== r.id
        )
        return {
          ...r,
          edicao_nome: edicaoMap[r.edicao_id]?.nome,
          edicao_local: edicaoMap[r.edicao_id]?.local,
          edicao_data: edicaoMap[r.edicao_id]?.data,
          colega_nome: colega?.nome_atleta ?? null,
        }
      })
      setResultados(enriquecidos)
    } else {
      setResultados([])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { carregar() }, [carregar])

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    if (busca.trim().length < 3) return
    setBuscando(true)
    const { data } = await supabase
      .from('race_results')
      .select('id, dorsal, nome_atleta, categoria, edicao_id')
      .is('user_id', null)
      .or(`nome_atleta.ilike.%${busca.trim()}%,dorsal.eq.${busca.trim()}`)
      .limit(8)

    const edicaoIds = [...new Set((data ?? []).map(r => r.edicao_id))]
    const { data: edicoes } = edicaoIds.length
      ? await supabase.from('race_editions').select('id, nome').in('id', edicaoIds)
      : { data: [] }
    const edicaoMap: Record<string, string> = {}
    edicoes?.forEach(e => { edicaoMap[e.id] = e.nome })

    setCandidatos((data ?? []).map(r => ({
      id: r.id, dorsal: r.dorsal, nome_atleta: r.nome_atleta, categoria: r.categoria,
      edicao_nome: edicaoMap[r.edicao_id] ?? 'Crossers',
    })))
    setBuscando(false)
  }

  async function handleClaim(id: string) {
    setAClaimar(id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAClaimar(null); return }
    await supabase
      .from('race_results')
      .update({ user_id: user.id, claimed_at: new Date().toISOString() })
      .eq('id', id)
      .is('user_id', null)
    setCandidatos([])
    setBusca('')
    setAClaimar(null)
    carregar()
  }

  if (loading) return null

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Eventos Realizados
      </p>

      {resultados.length === 0 ? (
        <p style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>
          Ainda não encontrámos nenhuma prova associada à tua conta.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resultados.map(r => (
            <div key={r.id} style={{
              border: '1px solid var(--border)', borderRadius: '12px', padding: '16px',
              background: 'var(--bg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.edicao_nome}</div>
                {r.status === 'DNF' ? (
                  <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>DNF</span>
                ) : (
                  <span style={{ background: 'rgba(76,175,80,0.1)', color: 'var(--accent)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>Concluído</span>
                )}
              </div>
              <div style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '2px' }}>
                {r.edicao_local} {r.edicao_data ? `· ${new Date(r.edicao_data).toLocaleDateString('pt-PT')}` : ''}
              </div>
              <div style={{ color: 'var(--gray-light)', fontSize: '13px', marginTop: '8px' }}>
                Dorsal #{r.dorsal} · {r.categoria}{r.colega_nome ? ` · com ${r.colega_nome}` : ''}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '8px', overflow: 'hidden', marginTop: '12px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-bebas), sans-serif' }}>{formatTempo(r.tempo_total_segundos)}</div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-mid)' }}>Tempo</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-bebas), sans-serif' }}>{r.posicao_categoria ?? '—'}º</div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-mid)' }}>No escalão</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-bebas), sans-serif' }}>{r.posicao_geral_genero ?? '—'}º</div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-mid)' }}>Geral</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Procurar e associar manualmente */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
        <p style={{ fontSize: '13px', color: 'var(--gray-mid)', marginBottom: '10px' }}>
          Não encontraste o teu resultado? Procura pelo teu nome ou número de dorsal.
        </p>
        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Nome ou dorsal"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={buscando} style={{ width: 'auto', padding: '10px 20px' }}>
            {buscando ? '...' : 'Procurar'}
          </button>
        </form>

        {candidatos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {candidatos.map(c => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
                border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{c.nome_atleta}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-mid)' }}>{c.edicao_nome} · Dorsal #{c.dorsal} · {c.categoria}</div>
                </div>
                <button
                  onClick={() => handleClaim(c.id)}
                  disabled={aClaimar === c.id}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', flexShrink: 0 }}
                >
                  {aClaimar === c.id ? '...' : 'Este sou eu'}
                </button>
              </div>
            ))}
          </div>
        )}
        {candidatos.length === 0 && busca && !buscando && (
          <p style={{ fontSize: '12px', color: 'var(--gray-mid)', marginTop: '10px' }}>Sem resultados para essa pesquisa.</p>
        )}
      </div>
    </div>
  )
}
