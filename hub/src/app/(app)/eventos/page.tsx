import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function EventosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date().toISOString()

  const { data: ativos } = await supabase
    .from('events')
    .select('id, nome, descricao, data_inicio, data_fim, unidade_resultado, tipo')
    .eq('ativo', true)
    .gte('data_fim', now)
    .order('data_fim', { ascending: true })

  const { data: passados } = await supabase
    .from('events')
    .select('id, nome, data_inicio, data_fim, unidade_resultado, tipo')
    .eq('ativo', true)
    .lt('data_fim', now)
    .order('data_fim', { ascending: false })
    .limit(5)

  const { data: inscricoes } = await supabase
    .from('event_entries')
    .select('event_id')
    .eq('user_id', user!.id)

  const inscritoIds = new Set(inscricoes?.map(i => i.event_id) ?? [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '40px', lineHeight: 1.1 }}>
          EVENTOS & <span style={{ color: 'var(--accent)' }}>DESAFIOS</span>
        </h1>
        <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginTop: '4px' }}>
          Compete, supera-te e sobe no leaderboard.
        </p>
      </div>

      {/* Eventos ativos */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '22px', marginBottom: '14px' }}>
          ATIVOS <span style={{ color: 'var(--accent)' }}>AGORA</span>
        </h2>
        {!ativos || ativos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-mid)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏁</div>
            <p>Nenhum evento activo neste momento.</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Em breve novos desafios!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ativos.map(ev => {
              const dias = Math.ceil((new Date(ev.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const inscrito = inscritoIds.has(ev.id)
              return (
                <Link key={ev.id} href={`/eventos/${ev.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '16px' }}>{ev.nome}</span>
                          {inscrito && (
                            <span style={{ background: 'rgba(76,175,80,0.15)', color: 'var(--accent)', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                              inscrito
                            </span>
                          )}
                        </div>
                        {ev.descricao && <p style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>{ev.descricao}</p>}
                        <div style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '6px' }}>
                          {ev.unidade_resultado} · {ev.tipo}
                        </div>
                      </div>
                      <div style={{
                        background: dias <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(76,175,80,0.1)',
                        color: dias <= 3 ? '#f87171' : 'var(--accent)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {dias}d restantes
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Eventos passados */}
      {passados && passados.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '22px', marginBottom: '14px', color: 'var(--gray-mid)' }}>
            EVENTOS PASSADOS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {passados.map(ev => (
              <Link key={ev.id} href={`/eventos/${ev.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ opacity: 0.6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{ev.nome}</div>
                    <div style={{ color: 'var(--gray-mid)', fontSize: '12px' }}>{ev.unidade_resultado}</div>
                  </div>
                  <div style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>
                    {new Date(ev.data_fim).toLocaleDateString('pt-PT')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
