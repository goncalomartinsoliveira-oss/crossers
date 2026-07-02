import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const nivelConfig: Record<string, { label: string; color: string; bg: string }> = {
  iniciante:  { label: 'Iniciante',  color: 'var(--accent)', bg: 'rgba(76,175,80,0.12)' },
  intermedio: { label: 'Intermédio', color: '#fbbf24',       bg: 'rgba(251,191,36,0.12)' },
  avancado:   { label: 'Avançado',   color: '#f87171',       bg: 'rgba(239,68,68,0.12)' },
}

const nivelOrder = ['iniciante', 'intermedio', 'avancado']

function tipoFromNome(nome: string): { label: string; color: string } {
  if (nome.toLowerCase().includes('hyrox')) return { label: 'HYROX', color: '#f87171' }
  return { label: 'Híbrido', color: '#60a5fa' }
}

export default async function PlanosPage() {
  const supabase = await createClient()

  const { data: planos } = await supabase
    .from('training_plans')
    .select('id, nome, descricao, nivel, duracao_semanas')
    .eq('ativo', true)
    .order('nome')

  const byNivel: Record<string, typeof planos> = {}
  planos?.forEach(p => {
    const n = p.nivel ?? 'iniciante'
    if (!byNivel[n]) byNivel[n] = []
    byNivel[n]!.push(p)
  })

  const totalPlanos = planos?.length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
          {totalPlanos} programas disponíveis
        </p>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '40px', lineHeight: 1 }}>
          PLANOS DE <span style={{ color: 'var(--accent)' }}>TREINO</span>
        </h1>
        <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginTop: '6px' }}>
          Programas de 8 semanas para atletas híbridos e competidores HYROX.
        </p>
      </div>

      {!planos || planos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-mid)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <p>Nenhum plano disponível ainda.</p>
        </div>
      ) : (
        nivelOrder.filter(n => byNivel[n]?.length).map(nivel => {
          const cfg = nivelConfig[nivel]
          return (
            <div key={nivel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{
                  background: cfg.bg, color: cfg.color,
                  fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                  borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {cfg.label}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {byNivel[nivel]!.map(plano => {
                  const tipo = tipoFromNome(plano.nome)
                  return (
                    <Link key={plano.id} href={`/planos/${plano.id}`} style={{ textDecoration: 'none' }}>
                      <div className="card" style={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                            <span style={{
                              background: `${tipo.color}18`, color: tipo.color,
                              fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                              borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                              {tipo.label}
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', lineHeight: 1.3 }}>{plano.nome}</div>
                          {plano.descricao && (
                            <p style={{ color: 'var(--gray-mid)', fontSize: '13px', lineHeight: 1.55 }}>
                              {plano.descricao.length > 100 ? plano.descricao.slice(0, 100) + '…' : plano.descricao}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--gray-mid)', fontSize: '12px' }}>
                            {plano.duracao_semanas} semanas
                          </span>
                          <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>Ver plano →</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
