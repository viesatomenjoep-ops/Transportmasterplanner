'use client';

import { useState } from 'react';
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <img 
              src="/Logo.jpeg" 
              alt="Viesa Logo" 
              style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px', borderRadius: '8px' }}
            />
            <button className="mobile-only-btn" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>✕</button>
          </div>
          <h1 className="viesa-title">Viesa Master Transportplanner</h1>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href="/" className="nav-link" onClick={() => setSidebarOpen(false)}>
            <span style={{ marginRight: '12px' }}>📊</span>
            Dashboard
          </Link>
          <Link href="/planning" className="nav-link" onClick={() => setSidebarOpen(false)}>
            <span style={{ marginRight: '12px' }}>📅</span>
            Planbord
          </Link>
          <Link href="/order-entry" className="nav-link" onClick={() => setSidebarOpen(false)}>
            <span style={{ marginRight: '12px' }}>📝</span>
            Nieuwe Order
          </Link>
          <Link href="/drivers" className="nav-link" onClick={() => setSidebarOpen(false)}>
            <span style={{ marginRight: '12px' }}>👥</span>
            Chauffeurs
          </Link>
          <Link href="/customers" className="nav-link" onClick={() => setSidebarOpen(false)}>
            <span style={{ marginRight: '12px' }}>🏢</span>
            Klanten
          </Link>
          <Link href="/customs" className="nav-link" onClick={() => setSidebarOpen(false)}>
            <span style={{ marginRight: '12px' }}>🌍</span>
            Douane (Overseas)
          </Link>
          <Link href="/driver" className="nav-link" style={{ marginTop: '24px', backgroundColor: 'var(--background-dark)', color: 'white' }}>
            <span style={{ marginRight: '12px' }}>📱</span>
            Bekijk Chauffeurs App
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-only-btn" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>☰</button>
            <div className="search-bar" style={{ position: 'relative' }}>
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
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
            <div className="user-info">
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
