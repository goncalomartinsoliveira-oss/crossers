import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PlanosPage() {
  const supabase = await createClient()

  const { data: planos } = await supabase
    .from('training_plans')
    .select('id, nome, descricao, nivel, duracao_semanas')
    .order('nivel')
    .order('nome')

  const niveis: Record<string, string> = {
    iniciante: '🟢 Iniciante',
    intermedio: '🟡 Intermédio',
    avancado: '🔴 Avançado',
  }

  const byNivel: Record<string, typeof planos> = {}
  planos?.forEach(p => {
    const n = p.nivel ?? 'iniciante'
    if (!byNivel[n]) byNivel[n] = []
    byNivel[n]!.push(p)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '40px', lineHeight: 1.1 }}>
          PLANOS DE <span style={{ color: 'var(--accent)' }}>TREINO</span>
        </h1>
        <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginTop: '4px' }}>
          Programas estruturados para evoluíres ao teu ritmo.
        </p>
      </div>

      {!planos || planos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-mid)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <p>Nenhum plano disponível ainda.</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Em breve novos programas!</p>
        </div>
      ) : (
        Object.entries(byNivel).map(([nivel, ps]) => (
          <div key={nivel}>
            <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '20px', marginBottom: '14px', color: 'var(--gray-light)' }}>
              {niveis[nivel] ?? nivel.toUpperCase()}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {ps!.map(plano => (
                <Link key={plano.id} href={`/planos/${plano.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{plano.nome}</div>
                      {plano.descricao && (
                        <p style={{ color: 'var(--gray-mid)', fontSize: '13px', lineHeight: 1.5 }}>{plano.descricao}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                      {plano.duracao_semanas && (
                        <span style={{ background: 'var(--border)', color: 'var(--gray-light)', fontSize: '11px', padding: '3px 8px', borderRadius: '10px' }}>
                          {plano.duracao_semanas} semanas
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
