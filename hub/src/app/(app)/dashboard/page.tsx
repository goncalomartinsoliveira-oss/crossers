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
    supabase.from('personal_records').select('id, exercise_id, resultado, data_registo')
      .eq('user_id', user!.id).order('data_registo', { ascending: false }).limit(5),
  ])

  const nome = profileRes.data?.nome?.split(' ')[0] ?? 'Atleta'
  const eventos = eventosRes.data ?? []
  const records = recordsRes.data ?? []

  const proximoEvento = eventos[0]
  const diasRestantes = proximoEvento
    ? Math.ceil((new Date(proximoEvento.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'BOM DIA' : hora < 18 ? 'BOA TARDE' : 'BOA NOITE'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div>
        <p style={{ color: 'var(--gray-mid)', fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {saudacao}
        </p>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '44px', lineHeight: 1, marginTop: '2px' }}>
          {nome.toUpperCase()} <span style={{ color: 'var(--accent)' }}>👋</span>
        </h1>
      </div>

      {/* Hero — próximo evento */}
      {proximoEvento ? (
        <Link href={`/eventos/${proximoEvento.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(46,125,50,0.08) 100%)',
            border: '1px solid rgba(76,175,80,0.3)',
            borderRadius: '16px', padding: '24px', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}>
            <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
              Próximo Evento
            </p>
            <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '28px', lineHeight: 1.1, marginBottom: '12px' }}>
              {proximoEvento.nome.toUpperCase()}
            </h2>
            {proximoEvento.descricao && (
              <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                {proximoEvento.descricao}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  background: diasRestantes! <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(76,175,80,0.1)',
                  color: diasRestantes! <= 3 ? '#f87171' : 'var(--accent)',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                }}>
                  {diasRestantes}d restantes
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.06)', color: 'var(--gray-light)',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
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
          background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)',
          borderRadius: '16px', padding: '32px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--gray-mid)', fontSize: '14px' }}>Nenhum evento activo no momento.</p>
          <p style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '4px' }}>Em breve novos desafios!</p>
        </div>
      )}

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          { label: 'Eventos', value: eventos.length.toString(), sub: 'ativos' },
          { label: 'Registos', value: records.length.toString(), sub: 'recentes' },
          { label: 'Streak', value: '—', sub: 'dias' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '16px 12px', borderRadius: '14px' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-bebas)' }}>{stat.value}</div>
            <div style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            <div style={{ color: 'var(--gray-mid)', fontSize: '10px', marginTop: '1px' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Acesso Rápido
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { href: '/registos/novo', label: 'Novo Registo', desc: 'Registar resultado', color: 'var(--accent)' },
            { href: '/eventos', label: 'Ver Eventos', desc: 'Todos os desafios', color: '#60a5fa' },
            { href: '/planos', label: 'Planos', desc: 'Programas de treino', color: '#c084fc' },
            { href: '/perfil', label: 'Perfil', desc: 'Editar dados', color: '#fb923c' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ borderRadius: '14px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: item.color, marginBottom: '2px' }}>{item.label}</div>
                <div style={{ color: 'var(--gray-mid)', fontSize: '12px' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Actividade recente */}
      {records.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Actividade Recente
            </h3>
            <Link href="/registos" style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {records.slice(0, 3).map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Registo: {r.resultado}</div>
                  <div style={{ color: 'var(--gray-mid)', fontSize: '11px' }}>
                    {new Date(r.data_registo).toLocaleDateString('pt-PT')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
