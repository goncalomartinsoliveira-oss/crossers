import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const categoryCor: Record<string, string> = {
  'Corrida': '#60a5fa', 'Remo': '#34d399', 'Ski ERG': '#a78bfa',
  'Bike': '#fbbf24', 'HYROX': '#f87171', 'Funcional': '#4CAF50', 'Força': '#fb923c',
}

const CATS = ['Corrida', 'Remo', 'Ski ERG', 'Bike', 'HYROX', 'Funcional', 'Força']

export default async function WorkoutDetailPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workout } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*)')
    .eq('id', workoutId)
    .eq('user_id', user!.id)
    .single()

  if (!workout) notFound()

  type WEx = { id: string; exercise_nome: string; categoria: string; quantidade: number; unidade: string; notas: string | null; ordem: number }
  const exs: WEx[] = (workout.workout_exercises ?? []).sort((a: WEx, b: WEx) => a.ordem - b.ordem)

  // Radar chart data — volume per category (normalised 0-100)
  const volByCat: Record<string, number> = {}
  exs.forEach((e: WEx) => {
    volByCat[e.categoria] = (volByCat[e.categoria] ?? 0) + e.quantidade
  })
  const presentCats = CATS.filter(c => volByCat[c])
  const maxVol = Math.max(...Object.values(volByCat), 1)
  const catPercent = (c: string) => Math.round(((volByCat[c] ?? 0) / maxVol) * 100)

  function fmtQtd(q: number, u: string) {
    if (u === 'seg') {
      const m = Math.floor(q / 60), s = q % 60
      return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`
    }
    if (u === 'm' && q >= 1000) return `${(q / 1000).toFixed(q % 1000 === 0 ? 0 : 1)}km`
    return `${q} ${u}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>

      {/* Header */}
      <div>
        <Link href="/registos" style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>← Treinos</Link>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '32px', lineHeight: 1, marginTop: '6px' }}>
          {workout.titulo?.toUpperCase() || new Date(workout.data_treino).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
        </h1>
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>
            📅 {new Date(workout.data_treino).toLocaleDateString('pt-PT')}
          </span>
          {workout.duracao_minutos && (
            <span style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>⏱ {workout.duracao_minutos} min</span>
          )}
          <span style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>💪 {exs.length} exercício{exs.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Distribuição por categoria */}
      {presentCats.length > 0 && (
        <div className="card">
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Distribuição
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {presentCats.map(cat => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: categoryCor[cat] ?? 'var(--gray-mid)' }}>{cat}</span>
                  <span style={{ fontSize: '12px', color: 'var(--gray-mid)' }}>{catPercent(cat)}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '4px', background: 'var(--border)' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    background: categoryCor[cat] ?? 'var(--accent)',
                    width: `${catPercent(cat)}%`, transition: 'width 0.4s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de exercícios */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Exercícios
        </p>
        {exs.map((e: WEx, i: number) => (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0',
            borderBottom: i < exs.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: `${categoryCor[e.categoria] ?? '#777'}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: categoryCor[e.categoria] ?? 'var(--gray-mid)',
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{e.exercise_nome}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '16px' }}>{fmtQtd(e.quantidade, e.unidade)}</span>
                <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '6px', background: `${categoryCor[e.categoria] ?? '#777'}22`, color: categoryCor[e.categoria] ?? 'var(--gray-mid)', fontWeight: 600 }}>
                  {e.categoria}
                </span>
              </div>
              {e.notas && <div style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '4px' }}>{e.notas}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Notas gerais */}
      {workout.notas && (
        <div className="card">
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Notas</p>
          <p style={{ color: 'var(--gray-light)', fontSize: '14px', lineHeight: 1.6 }}>{workout.notas}</p>
        </div>
      )}
    </div>
  )
}
