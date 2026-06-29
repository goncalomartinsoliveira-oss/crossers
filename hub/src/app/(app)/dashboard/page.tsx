import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('nome, genero')
    .eq('id', user!.id)
    .single()

  const { data: eventos } = await supabase
    .from('events')
    .select('id, nome, data_fim, unidade_resultado')
    .eq('ativo', true)
    .gte('data_fim', new Date().toISOString())
    .order('data_fim', { ascending: true })
    .limit(3)

  const nome = profile?.nome?.split(' ')[0] ?? 'Atleta'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontFamily: 'var(--font-bebas), sans-serif',
          fontSize: '40px',
          lineHeight: 1.1,
        }}>
          BOM DIA, <span style={{ color: 'var(--accent)' }}>{nome.toUpperCase()}</span>
        </h1>
        <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginTop: '4px' }}>
          run. perform. overcome.
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { href: '/eventos', label: 'Ver Eventos', icon: '🏆', desc: 'Desafios ativos' },
          { href: '/registos/novo', label: 'Novo Registo', icon: '➕', desc: 'Registar treino' },
          { href: '/planos', label: 'Planos', icon: '📋', desc: 'Ver planos' },
          { href: '/perfil', label: 'Perfil', icon: '👤', desc: 'Editar dados' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="quick-action-card" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</div>
              <div style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '2px' }}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Eventos ativos */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '24px' }}>
            EVENTOS <span style={{ color: 'var(--accent)' }}>ATIVOS</span>
          </h2>
          <Link href="/eventos" style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
            Ver todos →
          </Link>
        </div>

        {eventos && eventos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {eventos.map(evento => {
              const diasRestantes = Math.ceil(
                (new Date(evento.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              return (
                <Link key={evento.id} href={`/eventos/${evento.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{evento.nome}</div>
                      <div style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '2px' }}>
                        {evento.unidade_resultado}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: diasRestantes <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(76,175,80,0.1)',
                      color: diasRestantes <= 3 ? '#f87171' : 'var(--accent)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}>
                      {diasRestantes}d restantes
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', color: 'var(--gray-mid)', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏁</div>
            <p>Nenhum evento ativo neste momento.</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Em breve novos desafios!</p>
          </div>
        )}
      </div>
    </div>
  )
}
