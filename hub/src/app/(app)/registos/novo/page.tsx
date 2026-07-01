'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Exercise = { id: string; nome: string; categoria: string; unidade_resultado: string }
type WorkoutExercise = { exerciseId: string; nome: string; categoria: string; quantidade: string; unidade: string; notas: string }

const UNIDADES: Record<string, { label: string; placeholder: string }[]> = {
  tempo:    [{ label: 'min:seg', placeholder: 'ex: 3:45' }],
  distancia: [{ label: 'm', placeholder: 'ex: 500' }, { label: 'km', placeholder: 'ex: 5' }],
  reps:     [{ label: 'reps', placeholder: 'ex: 20' }],
}

const categoryCor: Record<string, string> = {
  'Corrida': '#60a5fa', 'Remo': '#34d399', 'Ski ERG': '#a78bfa',
  'Bike': '#fbbf24', 'HYROX': '#f87171', 'Funcional': '#4CAF50', 'Força': '#fb923c',
}

export default function NovoTreinoPage() {
  const supabase = createClient()
  const router = useRouter()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [duracao, setDuracao] = useState('')
  const [notas, setNotas] = useState('')
  const [lista, setLista] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // For adding an exercise
  const [addMode, setAddMode] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [selExercise, setSelExercise] = useState<Exercise | null>(null)
  const [selQuantidade, setSelQuantidade] = useState('')
  const [selUnidade, setSelUnidade] = useState('')
  const [selNotas, setSelNotas] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [customNome, setCustomNome] = useState('')
  const [customCategoria, setCustomCategoria] = useState('Funcional')
  const [customUnidade, setCustomUnidade] = useState('reps')

  useEffect(() => {
    supabase.from('exercises').select('id, nome, categoria, unidade_resultado')
      .order('categoria').order('nome')
      .then(({ data }) => setExercises(data ?? []))
  }, [])

  const categorias = [...new Set(exercises.map(e => e.categoria))]
  const filtered = searchQ
    ? exercises.filter(e => e.nome.toLowerCase().includes(searchQ.toLowerCase()) || e.categoria.toLowerCase().includes(searchQ.toLowerCase()))
    : exercises

  function pickExercise(ex: Exercise) {
    setSelExercise(ex)
    const units = UNIDADES[ex.unidade_resultado]
    setSelUnidade(units?.[0]?.label ?? ex.unidade_resultado)
    setSelQuantidade('')
    setSelNotas('')
    setSearchQ('')
  }

  function addExercise() {
    if (!selQuantidade) return
    if (customMode) {
      if (!customNome) return
      setLista(prev => [...prev, {
        exerciseId: '', nome: customNome, categoria: customCategoria,
        quantidade: selQuantidade, unidade: selUnidade || customUnidade, notas: selNotas,
      }])
    } else {
      if (!selExercise) return
      setLista(prev => [...prev, {
        exerciseId: selExercise.id, nome: selExercise.nome, categoria: selExercise.categoria,
        quantidade: selQuantidade, unidade: selUnidade, notas: selNotas,
      }])
    }
    setSelExercise(null)
    setSelQuantidade('')
    setSelNotas('')
    setCustomNome('')
    setAddMode(false)
    setCustomMode(false)
  }

  function removeExercise(idx: number) {
    setLista(prev => prev.filter((_, i) => i !== idx))
  }

  function parseQuantidade(val: string, unidade: string): number {
    if (unidade === 'min:seg') {
      const parts = val.split(':')
      if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1])
      return parseFloat(val) * 60
    }
    if (unidade === 'km') return parseFloat(val) * 1000
    return parseFloat(val)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (lista.length === 0) { setError('Adiciona pelo menos um exercício.'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: workout, error: wErr } = await supabase.from('workouts').insert({
      user_id: user!.id,
      titulo: titulo || null,
      data_treino: data,
      duracao_minutos: duracao ? parseInt(duracao) : null,
      notas: notas || null,
    }).select('id').single()

    if (wErr || !workout) { setError(wErr?.message ?? 'Erro ao guardar treino'); setLoading(false); return }

    const rows = lista.map((ex, i) => ({
      workout_id: workout.id,
      exercise_id: ex.exerciseId || null,
      exercise_nome: ex.nome,
      categoria: ex.categoria,
      quantidade: parseQuantidade(ex.quantidade, ex.unidade),
      unidade: ex.unidade === 'min:seg' ? 'seg' : ex.unidade === 'km' ? 'm' : ex.unidade,
      ordem: i,
      notas: ex.notas || null,
    }))

    const { error: exErr } = await supabase.from('workout_exercises').insert(rows)
    setLoading(false)
    if (exErr) { setError(exErr.message); return }
    router.push('/registos')
  }

  const byCategoria: Record<string, Exercise[]> = {}
  filtered.forEach(e => {
    if (!byCategoria[e.categoria]) byCategoria[e.categoria] = []
    byCategoria[e.categoria].push(e)
  })

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ color: 'var(--gray-mid)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Novo</p>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', lineHeight: 1 }}>REGISTO DE TREINO</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Info geral */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Info do Treino</p>
          <div>
            <label className="label">Título (opcional)</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="ex: HYROX Training, Corrida + Funcional..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Data</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} required />
            </div>
            <div>
              <label className="label">Duração (min)</label>
              <input type="number" min="1" value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="ex: 60" />
            </div>
          </div>
          <div>
            <label className="label">Notas gerais (opcional)</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} placeholder="Como correu o treino?" style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Lista de exercícios */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Exercícios {lista.length > 0 && <span style={{ color: 'var(--accent)' }}>({lista.length})</span>}
            </p>
          </div>

          {lista.map((ex, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
            }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                background: categoryCor[ex.categoria] ?? 'var(--gray-mid)',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{ex.nome}</div>
                <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 700 }}>{ex.quantidade} {ex.unidade}</div>
                {ex.notas && <div style={{ color: 'var(--gray-mid)', fontSize: '11px' }}>{ex.notas}</div>}
              </div>
              <button type="button" onClick={() => removeExercise(i)} style={{
                background: 'none', border: 'none', color: '#f87171', fontSize: '18px', padding: '4px 8px', cursor: 'pointer',
              }}>×</button>
            </div>
          ))}

          {/* Painel adicionar exercício */}
          {addMode ? (
            <div style={{ border: '1px solid rgba(76,175,80,0.3)', borderRadius: '12px', padding: '16px', background: 'rgba(76,175,80,0.04)' }}>
              {!selExercise && !customMode ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Pesquisar exercício..."
                    style={{ marginBottom: '12px' }}
                  />
                  <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {Object.entries(byCategoria).map(([cat, exs]) => (
                      <div key={cat}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: categoryCor[cat] ?? 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 0 4px' }}>{cat}</p>
                        {exs.map(ex => (
                          <button key={ex.id} type="button" onClick={() => pickExercise(ex)} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left',
                            padding: '8px 10px', borderRadius: '8px', background: 'transparent', border: 'none',
                            color: 'var(--white)', fontSize: '13px', cursor: 'pointer',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: categoryCor[cat] ?? '#777', flexShrink: 0 }} />
                            {ex.nome}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => { setCustomMode(true); setSelQuantidade(''); setSelUnidade('reps') }} style={{
                    marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px',
                    border: '1px dashed var(--border)', background: 'transparent', color: 'var(--gray-mid)',
                    fontSize: '13px', cursor: 'pointer',
                  }}>
                    + Criar exercício personalizado
                  </button>
                </>
              ) : customMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>Exercício Personalizado</p>
                  <input type="text" value={customNome} onChange={e => setCustomNome(e.target.value)} placeholder="Nome do exercício" autoFocus />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="label">Categoria</label>
                      <select value={customCategoria} onChange={e => setCustomCategoria(e.target.value)}>
                        {['Corrida','Remo','Ski ERG','Bike','HYROX','Funcional','Força','Outro'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Unidade</label>
                      <select value={customUnidade} onChange={e => setCustomUnidade(e.target.value)}>
                        <option value="reps">Reps</option>
                        <option value="m">Metros</option>
                        <option value="km">Km</option>
                        <option value="seg">Segundos</option>
                        <option value="min:seg">Min:Seg</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Quantidade</label>
                    <input type="text" value={selQuantidade} onChange={e => setSelQuantidade(e.target.value)} placeholder="ex: 20" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => { setCustomMode(false); setCustomNome('') }}>← Voltar</button>
                    <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={addExercise} disabled={!customNome || !selQuantidade}>Adicionar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: categoryCor[selExercise!.categoria] ?? '#777' }} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{selExercise!.nome}</span>
                    <span style={{ fontSize: '11px', color: 'var(--gray-mid)' }}>{selExercise!.categoria}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="label">Quantidade</label>
                      <input
                        autoFocus
                        type="text"
                        value={selQuantidade}
                        onChange={e => setSelQuantidade(e.target.value)}
                        placeholder={UNIDADES[selExercise!.unidade_resultado]?.[0]?.placeholder ?? 'ex: 20'}
                      />
                    </div>
                    <div>
                      <label className="label">Unidade</label>
                      <select value={selUnidade} onChange={e => setSelUnidade(e.target.value)}>
                        {selExercise!.unidade_resultado === 'tempo' && (
                          <>
                            <option value="min:seg">min:seg</option>
                            <option value="seg">seg</option>
                          </>
                        )}
                        {selExercise!.unidade_resultado === 'distancia' && (
                          <>
                            <option value="m">m</option>
                            <option value="km">km</option>
                          </>
                        )}
                        {selExercise!.unidade_resultado === 'reps' && (
                          <option value="reps">reps</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Notas (opcional)</label>
                    <input type="text" value={selNotas} onChange={e => setSelNotas(e.target.value)} placeholder="ex: pace 4:30/km, 20kg..." />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => { setSelExercise(null); setSelQuantidade('') }}>← Voltar</button>
                    <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={addExercise} disabled={!selQuantidade}>Adicionar</button>
                  </div>
                </div>
              )}
              {!selExercise && !customMode && (
                <button type="button" onClick={() => setAddMode(false)} style={{
                  marginTop: '8px', background: 'none', border: 'none', color: 'var(--gray-mid)', fontSize: '13px', cursor: 'pointer', padding: '4px 0',
                }}>Cancelar</button>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => setAddMode(true)} style={{
              width: '100%', padding: '14px', borderRadius: '10px',
              border: '1px dashed var(--border)', background: 'transparent', color: 'var(--accent)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'border-color 0.2s',
            }}>
              + Adicionar Exercício
            </button>
          )}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn-secondary" onClick={() => router.back()} style={{ flex: 1 }}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading || lista.length === 0} style={{ flex: 2 }}>
            {loading ? 'A guardar...' : `Guardar Treino${lista.length > 0 ? ` (${lista.length} ex.)` : ''}`}
          </button>
        </div>
      </form>
    </div>
  )
}
