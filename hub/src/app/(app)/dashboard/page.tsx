import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, eventosRes, recordsRes] = await Promise.all([
    supabase.from('users').select('nome').eq('id', user!.id).single(),
    supabase.from('events').select('id, nome, data_fim, unidade_resultado, descricao')
      .eq('ativo', true).gte('data_fim', new Date().toISOString())
      .order('data_fim', { ascending: true }).limit(3),
    supabase.from('workouts')
      .select('id, titulo, data_treino, duracao_minutos, workout_exercises(id, exercise_nome, categoria)')
      .eq('user_id', user!.id).order('data_treino', { ascending: false }).limit(5),
  ])

  const nome = profileRes.data?.nome?.split(' ')[0] ?? 'Atleta'
  const eventos = eventosRes.data ?? []
  const records = recordsRes.data ?? []

  const proximoEvento = eventos[0]
  const diasRestantes = proximoEvento
    ? Math.ceil((new Date(proximoEvento.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const quickActions = [
    {
      href: '/registos/novo', label: 'Novo Treino', desc: 'Registar sessão',
      color: 'var(--accent)', bg: 'rgba(76,175,80,0.08)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    },
    {
      href: '/eventos', label: 'Eventos', desc: 'Ver desafios',
      color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    },
    {
      href: '/planos', label: 'Planos', desc: 'Programas de treino',
      color: '#c084fc', bg: 'rgba(192,132,252,0.08)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      href: '/perfil', label: 'Perfil', desc: 'Editar dados',
      color: '#fb923c', bg: 'rgba(251,146,60,0.08)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <p style={{ color: 'var(--gray-mid)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
          {saudacao}
        </p>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '48px', lineHeight: 0.95, letterSpacing: '0.02em' }}>
          {nome.toUpperCase()}
        </h1>
      </div>

      {/* Hero — próximo evento */}
      {proximoEvento ? (
        <Link href={`/eventos/${proximoEvento.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(76,175,80,0.13) 0%, rgba(46,125,50,0.05) 100%)',
            border: '1px solid rgba(76,175,80,0.25)',
            borderRadius: '16px', padding: '22px 24px', cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <p style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
              ● Próximo Evento
            </p>
            <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '26px', lineHeight: 1.1, marginBottom: '10px' }}>
              {proximoEvento.nome.toUpperCase()}
            </h2>
            {proximoEvento.descricao && (
              <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                {proximoEvento.descricao}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  background: diasRestantes! <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(76,175,80,0.12)',
                  color: diasRestantes! <= 3 ? '#f87171' : 'var(--accent)',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  border: `1px solid ${diasRestantes! <= 3 ? 'rgba(239,68,68,0.2)' : 'rgba(76,175,80,0.2)'}`,
                }}>
                  {diasRestantes}d restantes
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.05)', color: 'var(--gray-mid)',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                  border: '1px solid var(--border)',
                }}>
                  {proximoEvento.unidade_resultado}
                </span>
              </div>
              <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>Ver →</span>
            </div>
          </div>
        </Link>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)',
          borderRadius: '16px', padding: '28px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--gray-mid)', fontSize: '14px' }}>Nenhum evento activo no momento.</p>
          <Link href="/eventos" style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
            Ver todos os eventos →
          </Link>
        </div>
      )}

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          { label: 'Eventos', value: eventos.length, sub: 'ativos', color: '#60a5fa' },
          { label: 'Treinos', value: records.length, sub: 'recentes', color: 'var(--accent)' },
          { label: 'Streak', value: '—', sub: 'dias', color: '#fb923c' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '18px 10px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-bebas)', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--white)', marginTop: '4px' }}>{stat.label}</div>
            <div style={{ color: 'var(--gray-mid)', fontSize: '10px', marginTop: '1px' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Acesso rápido */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Acesso Rápido
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {quickActions.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: item.bg, color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--white)' }}>{item.label}</div>
                  <div style={{ color: 'var(--gray-mid)', fontSize: '12px' }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Treinos recentes */}
      {records.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Treinos Recentes
            </p>
            <Link href="/registos" style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {records.slice(0, 3).map((r: { id: string; titulo: string | null; data_treino: string; workout_exercises: { id: string; exercise_nome: string; categoria: string }[] }) => (
              <Link key={r.id} href={`/registos/${r.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(76,175,80,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.titulo || new Date(r.data_treino).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ color: 'var(--gray-mid)', fontSize: '11px', marginTop: '1px' }}>
                      {r.workout_exercises?.length ?? 0} exercício{(r.workout_exercises?.length ?? 0) !== 1 ? 's' : ''} · {new Date(r.data_treino).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <span style={{ color: 'var(--gray-mid)', fontSize: '16px', flexShrink: 0 }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state treinos */}
      {records.length === 0 && (
        <div style={{
          border: '1px dashed var(--border)', borderRadius: '16px',
          padding: '32px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginBottom: '12px' }}>Ainda não tens treinos registados.</p>
          <Link href="/registos/novo" className="btn-primary" style={{ width: 'auto', padding: '10px 24px', display: 'inline-block' }}>
            Registar Primeiro Treino
          </Link>
        </div>
      )}
    </div>
  )
}
