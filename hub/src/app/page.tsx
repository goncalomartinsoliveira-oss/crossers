import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--white)', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px',
        background: 'linear-gradient(to bottom, rgba(12,18,16,0.95) 0%, transparent 100%)',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', letterSpacing: '0.1em' }}>
          CROSSERS <span style={{ color: 'var(--accent)' }}>HUB</span>
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" style={{
            color: 'var(--gray-light)', fontSize: '14px', fontWeight: 500,
            padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
            transition: 'color 0.2s',
          }}>
            Entrar
          </Link>
          <Link href="/register" style={{
            background: 'var(--accent)', color: '#000', fontSize: '14px', fontWeight: 700,
            padding: '9px 20px', borderRadius: '10px', textDecoration: 'none',
            transition: 'background 0.2s',
          }}>
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(76,175,80,0.12) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid decorativo */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(76,175,80,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(76,175,80,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.25)',
            borderRadius: '20px', padding: '6px 16px', marginBottom: '32px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
              PLATAFORMA PARA ATLETAS HÍBRIDOS
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(52px, 10vw, 96px)',
            lineHeight: 0.95, letterSpacing: '0.02em', marginBottom: '24px',
          }}>
            TREINA.<br />
            COMPETE.<br />
            <span style={{ color: 'var(--accent)' }}>EVOLUI.</span>
          </h1>

          <p style={{
            color: 'var(--gray-light)', fontSize: 'clamp(16px, 2.5vw, 20px)',
            lineHeight: 1.6, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px',
          }}>
            O Crossers Hub é a plataforma de treino para atletas que combinam corrida, força e resistência.
            Regista treinos, compete em eventos e segue planos desenhados para te levar mais longe.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: 'var(--accent)', color: '#000', fontSize: '16px', fontWeight: 700,
              padding: '15px 32px', borderRadius: '12px', textDecoration: 'none',
              transition: 'background 0.2s', display: 'inline-block',
            }}>
              Criar Conta Grátis
            </Link>
            <Link href="/login" style={{
              background: 'rgba(255,255,255,0.06)', color: 'var(--white)',
              border: '1px solid var(--border)', fontSize: '16px', fontWeight: 500,
              padding: '15px 32px', borderRadius: '12px', textDecoration: 'none',
              transition: 'border-color 0.2s', display: 'inline-block',
            }}>
              Já tenho conta →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden',
        }}>
          {[
            { value: 'HYROX', label: 'Foco em competição' },
            { value: '8', label: 'Semanas de planos' },
            { value: '360°', label: 'Visão do teu treino' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '32px 24px', textAlign: 'center',
              background: 'var(--bg-card)',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '40px', color: 'var(--accent)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'var(--gray-mid)', fontSize: '13px', marginTop: '6px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '40px 24px 100px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: 'var(--gray-mid)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', marginBottom: '12px' }}>
            O que encontras no Hub
          </p>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(32px, 6vw, 52px)', textAlign: 'center', marginBottom: '60px', lineHeight: 1 }}>
            TUDO O QUE PRECISAS,<br /><span style={{ color: 'var(--accent)' }}>NUM SÓ LUGAR</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
                title: 'Registo de Treinos',
                desc: 'Monta o teu treino exercício a exercício. Ski ERG, sled push, corrida, remo — regista tudo com quantidades e notas.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ),
                title: 'Eventos & Desafios',
                desc: 'Inscreve-te em desafios da comunidade, submete o teu resultado e sobe no leaderboard contra outros atletas.',
                accent: '#60a5fa',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                ),
                title: 'Planos de Treino',
                desc: '6 planos de 8 semanas — Híbrido e HYROX, de iniciante a elite. Estruturados dia a dia para evolução real.',
                accent: '#c084fc',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                ),
                title: 'Perfil do Atleta',
                desc: 'Fotografia, estatísticas de actividade, gráfico das últimas 8 semanas. O teu histórico de atleta num só lugar.',
                accent: '#fb923c',
              },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '28px 24px',
                display: 'flex', flexDirection: 'column', gap: '14px',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{f.title}</div>
                  <div style={{ color: 'var(--gray-mid)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: '40px 24px 100px' }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(76,175,80,0.12) 0%, rgba(46,125,50,0.06) 100%)',
          border: '1px solid rgba(76,175,80,0.25)', borderRadius: '24px', padding: '64px 32px',
        }}>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(36px, 7vw, 60px)', lineHeight: 1, marginBottom: '16px' }}>
            PRONTO PARA<br /><span style={{ color: 'var(--accent)' }}>COMEÇAR?</span>
          </h2>
          <p style={{ color: 'var(--gray-light)', fontSize: '16px', marginBottom: '32px', lineHeight: 1.6 }}>
            Junta-te à comunidade de atletas híbridos do Crossers Hub.<br />Gratuito, para sempre.
          </p>
          <Link href="/register" style={{
            background: 'var(--accent)', color: '#000', fontSize: '16px', fontWeight: 700,
            padding: '16px 40px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block',
          }}>
            Criar Conta Grátis
          </Link>
          <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginTop: '16px' }}>
            Já tens conta?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Entrar →
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-mid)', fontSize: '13px' }}>
          © 2025 Crossers Hub · <a href="https://crossers.pt" style={{ color: 'var(--gray-mid)', textDecoration: 'none' }}>crossers.pt</a>
        </p>
      </footer>

    </div>
  )
}
