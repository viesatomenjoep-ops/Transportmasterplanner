export default function Home() {
  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 className="page-title">Plannings Dashboard</h2>
        <button className="btn btn-primary">+ Nieuwe Rit Inplannen</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>Actieve Ritten</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>Chauffeurs Onderweg</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>8</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>Voltooid Vandaag</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>24</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '1.125rem' }}>Recente Ritten</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: '500' }}>ID</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: '500' }}>Klant</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: '500' }}>Chauffeur</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontWeight: '500' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px 0', fontWeight: '500' }}>#TR-1001</td>
              <td style={{ padding: '16px 0' }}>Logistics Corp BV</td>
              <td style={{ padding: '16px 0' }}>Jan Jansen</td>
              <td style={{ padding: '16px 0' }}><span style={{ backgroundColor: 'var(--status-loaded)', color: 'white', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold' }}>Geladen</span></td>
            </tr>
            <tr>
              <td style={{ padding: '16px 0', fontWeight: '500' }}>#TR-1002</td>
              <td style={{ padding: '16px 0' }}>MegaStore XL</td>
              <td style={{ padding: '16px 0' }}>Peter de Vries</td>
              <td style={{ padding: '16px 0' }}><span style={{ backgroundColor: 'var(--status-planned)', color: 'white', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold' }}>Gepland</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
