import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SubmitResultForm from './SubmitResultForm'
import InscricaoBtn from './InscricaoBtn'

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: evento } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!evento) notFound()

  const { data: entries } = await supabase
    .from('event_entries')
    .select('id, resultado, user_id')
    .eq('event_id', id)
    .order('resultado', { ascending: true, nullsFirst: false })

  // Fetch names separately
  const userIds = [...new Set(entries?.map(e => e.user_id) ?? [])]
  const { data: userNames } = userIds.length > 0
    ? await supabase.from('users').select('id, nome').in('id', userIds)
    : { data: [] }
  const nameMap: Record<string, string> = {}
  userNames?.forEach(u => { nameMap[u.id] = u.nome })

  const minhaEntry = entries?.find(e => e.user_id === user!.id) ?? null
  const inscrito = minhaEntry != null
  const temResultado = minhaEntry?.resultado != null

  const terminado = new Date(evento.data_fim) < new Date()
  const dias = Math.ceil((new Date(evento.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const inscritos = entries ?? []
  const comResultado = inscritos.filter(e => e.resultado != null)
  const semResultado = inscritos.filter(e => e.resultado == null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '640px' }}>

      {/* Header */}
      <div>
        <Link href="/eventos" style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>← Eventos</Link>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', lineHeight: 1.1, marginTop: '4px' }}>
          {evento.nome.toUpperCase()}
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>{evento.unidade_resultado} · {evento.tipo}</span>
          {!terminado ? (
            <span style={{
              background: dias <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(76,175,80,0.1)',
              color: dias <= 3 ? '#f87171' : 'var(--accent)',
              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
            }}>
              {dias}d restantes
            </span>
          ) : (
            <span style={{ background: 'rgba(136,136,136,0.15)', color: 'var(--gray-mid)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
              Terminado
            </span>
          )}
        </div>
        {evento.descricao && (
          <p style={{ color: 'var(--gray-light)', fontSize: '14px', marginTop: '12px', lineHeight: 1.6 }}>{evento.descricao}</p>
        )}
      </div>

      {/* Stats */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', padding: 0 }}>
        {[
          { label: 'Início', value: new Date(evento.data_inicio).toLocaleDateString('pt-PT') },
          { label: 'Fim', value: new Date(evento.data_fim).toLocaleDateString('pt-PT') },
          { label: 'Inscritos', value: inscritos.length },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--white)' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Inscrição */}
      {!terminado && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            A tua participação
          </p>
          <InscricaoBtn
            eventoId={id}
            inscrito={inscrito}
            entryId={minhaEntry?.id ?? null}
          />
        </div>
      )}

      {/* Submeter resultado — só para inscritos */}
      {!terminado && inscrito && (
        <SubmitResultForm
          eventoId={id}
          unidade={evento.unidade_resultado}
          minhaEntry={minhaEntry}
        />
      )}

      {/* Leaderboard */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '22px' }}>LEADERBOARD</h2>
          {comResultado.length > 0 && (
            <span style={{ color: 'var(--gray-mid)', fontSize: '12px' }}>{comResultado.length} resultado{comResultado.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {comResultado.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-mid)' }}>
            <p>Ainda não há resultados.{!terminado ? ' Sê o primeiro!' : ''}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {comResultado.map((entry, i) => {
              const isMe = entry.user_id === user!.id
              const nome = nameMap[entry.user_id] ?? 'Atleta'
              return (
                <div key={entry.id} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: isMe ? 'rgba(76,175,80,0.06)' : undefined,
                  borderColor: isMe ? 'var(--accent)' : undefined,
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '14px', color: i < 3 ? '#000' : 'var(--gray-mid)',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>
                      {nome} {isMe && <span style={{ color: 'var(--accent)', fontSize: '12px' }}>(tu)</span>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: i === 0 ? '#FFD700' : isMe ? 'var(--accent)' : 'var(--white)' }}>
                    {formatResult(entry.resultado!, evento.unidade_resultado)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Inscritos sem resultado */}
      {semResultado.length > 0 && (
        <div>
          <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Inscritos — aguardam resultado ({semResultado.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {semResultado.map(e => {
              const isMe = e.user_id === user!.id
              return (
                <span key={e.id} style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '13px',
                  background: isMe ? 'rgba(76,175,80,0.12)' : 'var(--border)',
                  color: isMe ? 'var(--accent)' : 'var(--gray-light)',
                  fontWeight: isMe ? 600 : 400,
                  border: isMe ? '1px solid rgba(76,175,80,0.3)' : '1px solid transparent',
                }}>
                  {nameMap[e.user_id] ?? 'Atleta'}{isMe ? ' (tu)' : ''}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatResult(valor: number, unidade: string): string {
  if (unidade === 'tempo') {
    const mins = Math.floor(valor / 60)
    const secs = valor % 60
    return mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`
  }
  if (unidade === 'distancia') return `${valor}m`
  return `${valor} reps`
}
