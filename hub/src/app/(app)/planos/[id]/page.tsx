import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Semana = {
  semana: number
  dias: {
    dia: string
    treino: string
    detalhes?: string
  }[]
}

export default async function PlanoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: plano } = await supabase
    .from('training_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (!plano) notFound()

  const conteudo: Semana[] = plano.conteudo_json ?? []

  const nivelCor: Record<string, string> = {
    iniciante: 'rgba(76,175,80,0.15)',
    intermedio: 'rgba(255,193,7,0.15)',
    avancado: 'rgba(239,68,68,0.15)',
  }
  const nivelTextCor: Record<string, string> = {
    iniciante: 'var(--accent)',
    intermedio: '#FFC107',
    avancado: '#f87171',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '720px' }}>
      <div>
        <Link href="/planos" style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>← Planos</Link>
        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '36px', lineHeight: 1.1, marginTop: '4px' }}>
          {plano.nome.toUpperCase()}
        </h1>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          {plano.nivel && (
            <span style={{ background: nivelCor[plano.nivel] ?? 'var(--border)', color: nivelTextCor[plano.nivel] ?? 'var(--white)', fontSize: '12px', padding: '3px 10px', borderRadius: '10px', fontWeight: 600 }}>
              {plano.nivel.charAt(0).toUpperCase() + plano.nivel.slice(1)}
            </span>
          )}
          {plano.categoria && (
            <span style={{ background: 'var(--border)', color: 'var(--gray-light)', fontSize: '12px', padding: '3px 10px', borderRadius: '10px' }}>
              {plano.categoria}
            </span>
          )}
          {plano.duracao_semanas && (
            <span style={{ background: 'var(--border)', color: 'var(--gray-light)', fontSize: '12px', padding: '3px 10px', borderRadius: '10px' }}>
              {plano.duracao_semanas} semanas
            </span>
          )}
        </div>
        {plano.descricao && (
          <p style={{ color: 'var(--gray-light)', fontSize: '14px', marginTop: '12px', lineHeight: 1.6 }}>{plano.descricao}</p>
        )}
      </div>

      {conteudo.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-mid)' }}>
          <p>Conteúdo do plano ainda não disponível.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {conteudo.map((semana) => (
            <div key={semana.semana}>
              <h2 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '20px', color: 'var(--accent)', marginBottom: '12px' }}>
                SEMANA {semana.semana}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {semana.dias.map((d, i) => (
                  <div key={i} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '80px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', paddingTop: '2px' }}>
                      {d.dia.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{d.treino}</div>
                      {d.detalhes && (
                        <div style={{ color: 'var(--gray-mid)', fontSize: '13px', marginTop: '4px', lineHeight: 1.5 }}>{d.detalhes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
