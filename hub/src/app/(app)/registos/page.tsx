import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RegistosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, nome, categoria, unidade_resultado')
    .order('categoria')
    .order('nome')

  const { data: records } = await supabase
    .from('personal_records')
    .select('exercise_id, resultado, unidade_resultado')
    .eq('user_id', user!.id)

  // Best record per exercise
  const bestByExercise: Record<string, number> = {}
  records?.forEach(r => {
    const current = bestByExercise[r.exercise_id]
    if (current === undefined || r.resultado < current) {
      bestByExercise[r.exercise_id] = r.resultado
    }
  })

  // Group by category
  const byCategory: Record<string, typeof exercises> = {}
  exercises?.forEach(ex => {
    if (!byCategory[ex.categoria]) byCategory[ex.categoria] = []
    byCategory[ex.categoria]!.push(ex)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '40px', lineHeight: 1.1 }}>
            REGISTOS <span style={{ color: 'var(--accent)' }}>PESSOAIS</span>
          </h1>
          <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginTop: '4px' }}>
            Os teus melhores resultados por exercício.
          </p>
        </div>
        <Link href="/registos/novo" className="btn-primary" style={{ width: 'auto', padding: '10px 20px', textDecoration: 'none', display: 'inline-block' }}>
          + Novo Registo
        </Link>
      </div>

      {Object.keys(byCategory).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-mid)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <p>Nenhum exercício disponível ainda.</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([categoria, exs]) => (
          <div key={categoria}>
            <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '20px', color: 'var(--gray-light)', marginBottom: '12px', letterSpacing: '0.1em' }}>
              {categoria.toUpperCase()}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exs!.map(ex => {
                const best = bestByExercise[ex.id]
                return (
                  <Link key={ex.id} href={`/registos/${ex.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                      onMouseEnter={undefined}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{ex.nome}</div>
                        <div style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '2px' }}>{ex.unidade_resultado}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {best !== undefined ? (
                          <>
                            <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '18px' }}>
                              {formatResult(best, ex.unidade_resultado)}
                            </div>
                            <div style={{ color: 'var(--gray-mid)', fontSize: '11px' }}>melhor registo</div>
                          </>
                        ) : (
                          <div style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>sem registo</div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))
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
