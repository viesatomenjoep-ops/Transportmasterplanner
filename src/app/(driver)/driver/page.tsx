'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MY_DRIVER_ID = 'd1000000-0000-0000-0000-000000000001';

export default function DriverPage() {
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tacho Timer State
  const [drivingTimeRemaining, setDrivingTimeRemaining] = useState(4.5 * 60 * 60); // 4.5 uur in seconden
  
  // Signature Modal State
  const [showPodModal, setShowPodModal] = useState(false);
  const [podName, setPodName] = useState('');
  const [palletsReturned, setPalletsReturned] = useState(0);

  useEffect(() => {
    fetchMyRide();
    
    // Simuleer aflopende tacho timer
    const interval = setInterval(() => {
      setDrivingTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
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
    
    setRide({ ...ride, status: newStatus });
    await supabase.from('rides').update({ status: newStatus }).eq('id', ride.id);
    
    // Simuleer een event-log voor webhook automations
    await supabase.from('ride_events').insert({
      ride_id: ride.id,
      event_type: newStatus,
      description: `Status geüpdatet naar ${newStatus} door chauffeur`,
      lat: 51.9225, // Mock GPS
      lng: 4.47917
    });
  };

  const submitPOD = async () => {
    if (!ride) return;
    
    // Save POD to database
    await supabase.from('proof_of_delivery').insert({
      ride_id: ride.id,
      signed_by_name: podName,
      pallets_returned: palletsReturned,
      notes: 'Afgeleverd via Driver App POD'
    });
    
    setShowPodModal(false);
    handleStatusUpdate('afgeleverd');
    alert('Vrachtbrief succesvol verwerkt & verzonden naar administratie!');
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{ padding: '24px', color: 'white' }}>Laden van rit data...</div>;

  if (!ride) return (
    <div className="driver-page" style={{ padding: '24px', textAlign: 'center' }}>
      <h2 style={{marginTop: '40px'}}>Geen Actieve Ritten</h2>
    </div>
  );

  return (
    <div className="driver-page">
      <header className="driver-header">
        <h1>Actieve Rit</h1>
        <div className="status-badge" style={{ backgroundColor: ride.status === 'geladen' ? 'var(--status-loaded)' : ride.status === 'afgeleverd' ? 'var(--status-delivered)' : 'var(--status-planned)' }}>
          {ride.status.toUpperCase()}
        </div>
      </header>

      {/* Tacho Pro Widget */}
      <div style={{ backgroundColor: drivingTimeRemaining < 1800 ? '#ef4444' : '#334155', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Rijtijd tot 45 min pauze</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(drivingTimeRemaining)}</div>
        </div>
        <div style={{ fontSize: '2rem' }}>⏱️</div>
      </div>

      <div className="driver-card">
        <h2>{ride.customers?.company_name || 'Onbekende Klant'}</h2>
        <p className="address" style={{marginBottom: '8px'}}>📍 Laad: {ride.pickup_address}</p>
        <p className="address">📍 Los: {ride.delivery_address}</p>
        
        <div className="details-grid">
          <div><span>Gewicht</span><strong>{ride.total_weight_kg || '-'} kg</strong></div>
          <div><span>Pallets</span><strong>{ride.pallets_count || '-'} stks</strong></div>
        </div>

        {ride.status === 'gepland' && (
          <button className="btn-massive btn-blue" onClick={() => handleStatusUpdate('geladen')}>Start Rit (Gereed voor vertrek)</button>
        )}
        
        {ride.status === 'geladen' && (
          <>
            <button className="btn-massive btn-blue" style={{ marginBottom: '16px' }}>Navigeer (Truck Route)</button>
            <button className="btn-massive btn-green" onClick={() => setShowPodModal(true)}>Aankomst & POD Tekenen</button>
          </>
        )}
        
        {ride.status === 'afgeleverd' && (
           <div style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', textAlign: 'center' }}>
             Rit succesvol afgerond! Wachten op nieuwe instructies.
           </div>
        )}
      </div>

      {/* POD Modal (Sign on Glass) */}
      {showPodModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <h2 style={{ marginBottom: '24px' }}>Proof of Delivery</h2>
          
          <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#cbd5e1' }}>Naam Ontvanger</label>
          <input 
            type="text" 
            value={podName}
            onChange={(e) => setPodName(e.target.value)}
            style={{ padding: '16px', borderRadius: '8px', border: 'none', marginBottom: '24px', fontSize: '1.1rem' }} 
            placeholder="Naam..."
          />
          
          <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#cbd5e1' }}>Europallets Retour</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <button onClick={() => setPalletsReturned(p => Math.max(0, p - 1))} style={{ width: '48px', height: '48px', borderRadius: '24px', border: 'none', fontSize: '1.5rem', backgroundColor: '#334155', color: 'white' }}>-</button>
            <span style={{ fontSize: '1.5rem', width: '40px', textAlign: 'center' }}>{palletsReturned}</span>
            <button onClick={() => setPalletsReturned(p => p + 1)} style={{ width: '48px', height: '48px', borderRadius: '24px', border: 'none', fontSize: '1.5rem', backgroundColor: '#334155', color: 'white' }}>+</button>
          </div>

          <label style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#cbd5e1' }}>Handtekening (Sign-on-glass)</label>
          <div style={{ height: '200px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span style={{ color: '#94a3b8' }}>[Teken met vinger]</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
            <button className="btn-massive" style={{ backgroundColor: '#334155', flex: 1 }} onClick={() => setShowPodModal(false)}>Annuleer</button>
            <button className="btn-massive btn-green" style={{ flex: 1 }} onClick={submitPOD}>Opslaan & Afronden</button>
          </div>
        </div>
      )}
    </div>
  );
}
