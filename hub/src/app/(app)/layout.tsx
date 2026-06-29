import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <main style={{
        flex: 1,
        marginLeft: '220px',
        padding: '32px',
        paddingBottom: '80px',
        maxWidth: '1200px',
      }} className="app-main">
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          .app-main {
            margin-left: 0 !important;
            padding: 20px 16px 90px !important;
          }
        }
      `}</style>
    </div>
  )
}
