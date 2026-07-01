import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RegistosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, titulo, data_treino, duracao_minutos, workout_exercises(id, exercise_nome, categoria, quantidade, unidade)')
    .eq('user_id', user!.id)
    .order('data_treino', { ascending: false })

  const list = workouts ?? []

  const categoryCor: Record<string, string> = {
    'Corrida': '#60a5fa',
    'Remo': '#34d399',
    'Ski ERG': '#a78bfa',
    'Bike': '#fbbf24',
    'HYROX': '#f87171',
    'Funcional': '#4CAF50',
    'Força': '#fb923c',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: 'var(--gray-mid)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Histórico</p>
          <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', lineHeight: 1 }}>TREINOS</h1>
        </div>
        <Link href="/registos/novo" className="btn-primary" style={{ width: 'auto', padding: '11px 20px', fontSize: '13px', display: 'inline-block', textAlign: 'center' }}>
          + Novo Treino
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏋️</div>
          <p style={{ color: 'var(--white)', fontWeight: 600, marginBottom: '6px' }}>Sem treinos registados</p>
          <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginBottom: '20px' }}>Começa a registar os teus treinos para acompanhar o teu progresso.</p>
          <Link href="/registos/novo" className="btn-primary" style={{ width: 'auto', padding: '11px 24px', display: 'inline-block' }}>
            Registar Primeiro Treino
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map(w => {
            const exs = (w.workout_exercises as { id: string; exercise_nome: string; categoria: string; quantidade: number; unidade: string }[]) ?? []
            const cats = [...new Set(exs.map(e => e.categoria).filter(Boolean))]
            return (
              <Link key={w.id} href={`/registos/${w.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '16px' }}>
                        {w.titulo || new Date(w.data_treino).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p style={{ color: 'var(--gray-mid)', fontSize: '12px', marginTop: '2px' }}>
                        {new Date(w.data_treino).toLocaleDateString('pt-PT')}
                        {w.duracao_minutos ? ` · ${w.duracao_minutos} min` : ''}
                        {` · ${exs.length} exercício${exs.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: '18px' }}>→</span>
                  </div>

                  {exs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {exs.slice(0, 3).map(e => (
                        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                            background: categoryCor[e.categoria] ?? 'var(--gray-mid)',
                          }} />
                          <span style={{ fontSize: '13px', color: 'var(--gray-light)' }}>
                            {e.exercise_nome} — <span style={{ color: 'var(--white)', fontWeight: 600 }}>{e.quantidade} {e.unidade}</span>
                          </span>
                        </div>
                      ))}
                      {exs.length > 3 && (
                        <p style={{ color: 'var(--gray-mid)', fontSize: '12px', paddingLeft: '18px' }}>+{exs.length - 3} mais</p>
                      )}
                    </div>
                  )}

                  {cats.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {cats.map(c => (
                        <span key={c} style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: 600,
                          background: `${categoryCor[c] ?? '#777'}22`,
                          color: categoryCor[c] ?? 'var(--gray-mid)',
                        }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
