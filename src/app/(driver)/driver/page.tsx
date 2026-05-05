'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Voor de demo hardcoden we de chauffeur Jan Jansen
const MY_DRIVER_ID = 'd1000000-0000-0000-0000-000000000001';

export default function DriverPage() {
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRide();
  }, []);

  const fetchMyRide = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rides')
      .select('*, customers(company_name)')
      .eq('driver_id', MY_DRIVER_ID)
      .limit(1)
      .single();
    
    if (data) setRide(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ride) return;
    
    // Optimistic UI update
    setRide({ ...ride, status: newStatus });

    // Update in Supabase
    await supabase
      .from('rides')
      .update({ status: newStatus })
      .eq('id', ride.id);
  };

  if (loading) return <div style={{ padding: '24px', color: 'white' }}>Laden van je rit...</div>;

  if (!ride) return (
    <div className="driver-page" style={{ padding: '24px', textAlign: 'center' }}>
      <h2 style={{marginTop: '40px'}}>Geen Actieve Ritten</h2>
      <p style={{color: 'var(--text-muted)', marginTop: '12px'}}>Je planner heeft nog geen rit aan jou toegewezen.</p>
    </div>
  );

  return (
    <div className="driver-page">
      <header className="driver-header">
        <h1>Actieve Rit</h1>
        <div className="status-badge" style={{ backgroundColor: ride.status === 'geladen' ? 'var(--status-loaded)' : 'var(--status-planned)' }}>
          {ride.status === 'geladen' ? 'Reeds Geladen' : 'Onderweg'}
        </div>
      </header>

      <div className="driver-card">
        <h2>{ride.customers?.company_name || 'Onbekende Klant'}</h2>
        <p className="address" style={{marginBottom: '8px'}}>📍 Laadadres: {ride.pickup_address}</p>
        <p className="address">📍 Losadres: {ride.delivery_address}</p>
        
        <div className="details-grid">
          <div>
            <span>Gewicht</span>
            <strong>{ride.total_weight_kg ? `${ride.total_weight_kg} kg` : '-'}</strong>
          </div>
          <div>
            <span>Pallets</span>
            <strong>{ride.pallets_count ? `${ride.pallets_count} stuks` : '-'}</strong>
          </div>
        </div>

        <button className="btn-massive btn-blue">Navigeer (Maps)</button>
        
        {ride.status !== 'geladen' && (
          <button 
            className="btn-massive btn-green" 
            style={{marginTop: '16px'}}
            onClick={() => handleStatusUpdate('geladen')}
          >
            Ik ben geladen
          </button>
        )}
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
