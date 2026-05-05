'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TrackAndTracePage({ params }: { params: { id: string } }) {
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRide();
    
    // Optioneel: Realtime updates via Supabase WebSockets toevoegen
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${params.id}` },
        (payload) => setRide(payload.new)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [params.id]);

  const fetchRide = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('rides')
      .select('*, customers(company_name)')
      .eq('id', params.id)
      .single();
    
    if (data) setRide(data);
    setLoading(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}><h3>Zending laden...</h3></div>;
  }

  if (!ride) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}><h3>Zending niet gevonden</h3></div>;
  }

  // Bepaal voortgang (0 - 100%)
  let progress = 10;
  if (ride.status === 'geladen') progress = 50;
  if (ride.status === 'afgeleverd') progress = 100;

  return (
    <div className="track-layout">
      {/* Premium Header */}
      <header className="track-header">
        <div className="track-brand">TransportApp Track & Trace</div>
        <div className="track-ride-id">Zending: #{ride.id.split('-')[0].toUpperCase()}</div>
      </header>

      <main className="track-main">
        {/* Klant Info Card */}
        <div className="track-card glass-panel">
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Welkom, {ride.customers?.company_name || 'Klant'}</h1>
          <p style={{ color: '#64748b' }}>Volg uw zending realtime via ons platform.</p>
        </div>

        {/* Live Map Animatie (Mockup) */}
        <div className="track-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '250px', backgroundColor: '#e2e8f0' }}>
          <div className="map-background"></div>
          {/* Rijdende Vrachtwagen */}
          {ride.status === 'geladen' && (
            <div className="moving-truck">🚚</div>
          )}
          {/* Bestemming bereikt */}
          {ride.status === 'afgeleverd' && (
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
               <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
               <div style={{ fontWeight: 'bold' }}>Zending Afgeleverd!</div>
             </div>
          )}
        </div>

        {/* Tijdlijn */}
        <div className="track-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Status Zending</h2>
          
          <div className="timeline-container">
            <div className="timeline-bar-bg">
              <div className="timeline-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="timeline-steps">
              <div className={`timeline-step ${progress >= 10 ? 'active' : ''}`}>
                <div className="step-dot"></div>
                <div className="step-label">Aangemeld</div>
                <div className="step-location">{ride.pickup_address}</div>
              </div>
              <div className={`timeline-step ${progress >= 50 ? 'active' : ''}`} style={{ textAlign: 'center' }}>
                <div className="step-dot" style={{ margin: '0 auto' }}></div>
                <div className="step-label">Onderweg</div>
                <div className="step-location">Live Tracking</div>
              </div>
              <div className={`timeline-step ${progress >= 100 ? 'active' : ''}`} style={{ textAlign: 'right' }}>
                <div className="step-dot" style={{ marginLeft: 'auto' }}></div>
                <div className="step-label">Afgeleverd</div>
                <div className="step-location">{ride.delivery_address}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Details */}
        <div className="track-card details-grid" style={{ backgroundColor: 'white' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Pallets</span>
            <strong style={{ color: '#0f172a' }}>{ride.pallets_count || '-'} stuks</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Gewicht</span>
            <strong style={{ color: '#0f172a' }}>{ride.total_weight_kg || '-'} kg</strong>
          </div>
        </div>

      </main>
    </div>
  );
}
