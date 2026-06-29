import { createClient } from '@/lib/supabase/server'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '40px', marginBottom: '24px' }}>
        O MEU <span style={{ color: 'var(--accent)' }}>PERFIL</span>
      </h1>
      <div className="card" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="label">Nome</span>
            <p style={{ fontSize: '15px' }}>{profile?.nome ?? '—'}</p>
          </div>
          <div>
            <span className="label">Email</span>
            <p style={{ fontSize: '15px' }}>{user?.email}</p>
          </div>
          <div>
            <span className="label">Género</span>
            <p style={{ fontSize: '15px' }}>{profile?.genero === 'M' ? 'Masculino' : 'Feminino'}</p>
          </div>
          <div>
            <span className="label">Data de Nascimento</span>
            <p style={{ fontSize: '15px' }}>
              {profile?.data_nascimento
                ? new Date(profile.data_nascimento).toLocaleDateString('pt-PT')
                : '—'}
            </p>
          </div>
          <div>
            <span className="label">Membro desde</span>
            <p style={{ fontSize: '15px' }}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('pt-PT')
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
