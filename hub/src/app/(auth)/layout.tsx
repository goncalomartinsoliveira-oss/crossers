export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg)',
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas), sans-serif',
          fontSize: '36px',
          letterSpacing: '0.1em',
          color: 'var(--white)',
        }}>
          CROSSERS <span style={{ color: 'var(--accent)' }}>HUB</span>
        </h1>
        <p style={{ color: 'var(--gray-mid)', fontSize: '13px', marginTop: '4px' }}>
          run. perform. overcome.
        </p>
      </div>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {children}
      </div>
    </div>
  )
}
