export default function DriverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="driver-layout" style={{ margin: '0 auto', maxWidth: '100%', '@media (min-width: 480px)': { maxWidth: '480px' } as any }}>
      <main className="driver-main">
        {children}
      </main>
      <nav className="driver-bottom-nav">
        <div className="nav-item active">
          <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📍</span>
          Huidige Rit
        </div>
        <div className="nav-item">
          <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📋</span>
          Planning
        </div>
        <div className="nav-item">
          <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⚙️</span>
          Instellingen
        </div>
      </nav>
    </div>
  );
}
