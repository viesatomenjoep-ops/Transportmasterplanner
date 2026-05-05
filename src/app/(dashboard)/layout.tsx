import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          TransportApp
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href="/" className="nav-link">
            <span style={{ marginRight: '12px' }}>📊</span>
            Dashboard
          </Link>
          <Link href="/planning" className="nav-link">
            <span style={{ marginRight: '12px' }}>🚚</span>
            Rittenplanning
          </Link>
          <Link href="/drivers" className="nav-link">
            <span style={{ marginRight: '12px' }}>👥</span>
            Chauffeurs
          </Link>
          <Link href="/customers" className="nav-link">
            <span style={{ marginRight: '12px' }}>🏢</span>
            Klanten
          </Link>
          <Link href="/driver" className="nav-link" style={{ marginTop: '24px', backgroundColor: 'var(--background-dark)', color: 'white' }}>
            <span style={{ marginRight: '12px' }}>📱</span>
            Bekijk App
          </Link>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <a href="#" className="nav-link">
            <span style={{ marginRight: '12px' }}>⚙️</span>
            Instellingen
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div style={{ position: 'relative', width: '300px' }}>
            <input 
              type="text" 
              placeholder="Zoek ritten of klanten..." 
              style={{ 
                width: '100%', 
                padding: '10px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--background-light)',
                outline: 'none'
              }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>Admin User</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Planner</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
