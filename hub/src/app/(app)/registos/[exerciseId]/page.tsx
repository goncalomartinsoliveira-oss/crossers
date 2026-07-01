import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ExerciseHistoryPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exercise } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single()

  if (!exercise) notFound()

  const { data: records } = await supabase
    .from('personal_records')
    .select('id, resultado, data_registo, notas')
    .eq('user_id', user!.id)
    .eq('exercise_id', exerciseId)
    .order('data_registo', { ascending: false })

  const best = records?.reduce((b, r) => r.resultado < b ? r.resultado : b, Infinity)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Link href="/registos" style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>← Registos</Link>
          <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', lineHeight: 1.1, marginTop: '4px' }}>
            {exercise.nome.toUpperCase()}
          </h1>
          <p style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>{exercise.categoria} · {exercise.unidade_resultado}</p>
        </div>
        <Link href={`/registos/novo`} className="btn-primary" style={{ width: 'auto', padding: '10px 20px', textDecoration: 'none', display: 'inline-block' }}>
          + Novo
        </Link>
      </div>

      {best !== Infinity && (
        <div className="card" style={{ display: 'flex', gap: '32px' }}>
          <div>
            <div style={{ color: 'var(--gray-mid)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Melhor Registo</div>
            <div style={{ color: 'var(--accent)', fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-bebas)' }}>
              {formatResult(best!, exercise.unidade_resultado)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--gray-mid)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Registos</div>
            <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-bebas)' }}>{records?.length ?? 0}</div>
          </div>
        </div>
      )}

      {!records || records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-mid)' }}>
          <p>Ainda não tens registos para este exercício.</p>
          <Link href="/registos/novo" style={{ color: 'var(--accent)', fontSize: '14px', marginTop: '12px', display: 'inline-block' }}>
            Fazer primeiro registo →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {records.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '18px', color: r.resultado === best ? 'var(--accent)' : 'var(--white)' }}>
                  {formatResult(r.resultado, exercise.unidade_resultado)}
                  {r.resultado === best && <span style={{ fontSize: '12px', marginLeft: '8px', color: 'var(--accent)' }}>★ melhor</span>}
                </div>
                {r.notas && <div style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '4px' }}>{r.notas}</div>}
              </div>
              <div style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>
                {new Date(r.data_registo).toLocaleDateString('pt-PT')}
              </div>
            </div>
          ))}
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
