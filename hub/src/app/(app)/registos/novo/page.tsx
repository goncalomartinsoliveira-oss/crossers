'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Exercise = {
  id: string
  nome: string
  categoria: string
  unidade_resultado: string
}

export default function NovoRegistoPage() {
  const supabase = createClient()
  const router = useRouter()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [exerciseId, setExerciseId] = useState('')
  const [resultado, setResultado] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('exercises').select('id, nome, categoria, unidade_resultado').order('categoria').order('nome')
      .then(({ data }) => setExercises(data ?? []))
  }, [])

  const selected = exercises.find(e => e.id === exerciseId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!exerciseId || !resultado) { setError('Preenche o exercício e o resultado.'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('personal_records').insert({
      user_id: user!.id,
      exercise_id: exerciseId,
      resultado: parseFloat(resultado),
      unidade_resultado: selected!.unidade_resultado,
      data_registo: data,
      notas: notas || null,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/registos')
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '40px', marginBottom: '8px' }}>
        NOVO <span style={{ color: 'var(--accent)' }}>REGISTO</span>
      </h1>
      <p style={{ color: 'var(--gray-mid)', fontSize: '14px', marginBottom: '32px' }}>
        Regista o teu resultado num exercício.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label className="label">Exercício</label>
          <select value={exerciseId} onChange={e => setExerciseId(e.target.value)} required>
            <option value="">Seleccionar exercício...</option>
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.categoria} — {ex.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            Resultado {selected ? `(${selected.unidade_resultado === 'tempo' ? 'segundos' : selected.unidade_resultado})` : ''}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={resultado}
            onChange={e => setResultado(e.target.value)}
            placeholder={selected?.unidade_resultado === 'tempo' ? 'ex: 180 (= 3 min)' : selected?.unidade_resultado === 'distancia' ? 'ex: 5000 (= 5km)' : 'ex: 20'}
            required
          />
        </div>

        <div>
          <label className="label">Data</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)} required />
        </div>

        <div>
          <label className="label">Notas (opcional)</label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Como correu? Condições, equipamento..." style={{ resize: 'vertical' }} />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn-secondary" onClick={() => router.back()} style={{ width: 'auto', flex: 1 }}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
            {loading ? 'A guardar...' : 'Guardar Registo'}
          </button>
        </div>
      </form>
    </div>
  )
}
