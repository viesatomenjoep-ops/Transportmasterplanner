export default function DriverPage() {
  return (
    <div className="driver-page">
      <header className="driver-header">
        <h1>Actieve Rit</h1>
        <div className="status-badge">Onderweg</div>
      </header>

      <div className="driver-card">
        <h2>MegaStore XL</h2>
        <p className="address">📍 Den Bosch DC, De Corridor 12</p>
        
        <div className="details-grid">
          <div>
            <span>Gewicht</span>
            <strong>24.500 kg</strong>
          </div>
          <div>
            <span>Pallets</span>
            <strong>32 stuks</strong>
          </div>
        </div>

        <button className="btn-massive btn-blue">Navigeer (Maps)</button>
        <button className="btn-massive btn-green" style={{marginTop: '16px'}}>Arriveerde op Bestemming</button>
      </div>

      <div className="driver-tacho">
        <h3 style={{ marginBottom: '8px' }}>Tachograaf (Vandaag)</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>4.5u max aaneengesloten rijtijd</p>
        <div className="tacho-bar">
          <div className="driving" style={{width: '60%'}}>2.7u Rijden</div>
          <div className="resting" style={{width: '40%'}}>Rest</div>
        </div>
      </div>
    </div>
  );
}
