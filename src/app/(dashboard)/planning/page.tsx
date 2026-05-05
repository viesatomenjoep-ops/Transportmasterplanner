'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PlanningPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch drivers
    const { data: driversData } = await supabase.from('drivers').select('*');
    // Fetch rides with customer info
    const { data: ridesData } = await supabase
      .from('rides')
      .select('*, customers(company_name)');

    if (driversData) setDrivers(driversData);
    if (ridesData) setRides(ridesData);
    setLoading(false);
  };

  const onDragStart = (e: React.DragEvent, rideId: string) => {
    e.dataTransfer.setData('rideId', rideId);
    e.currentTarget.classList.add('dragging');
  };

  const onDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, targetDriverId: string | null) => {
    e.preventDefault();
    const rideId = e.dataTransfer.getData('rideId');
    
    // Optimistic UI update
    setRides((prevRides) => 
      prevRides.map(ride => 
        ride.id === rideId ? { ...ride, driver_id: targetDriverId } : ride
      )
    );

    // Persist to Supabase
    await supabase
      .from('rides')
      .update({ driver_id: targetDriverId })
      .eq('id', rideId);
  };

  if (loading) return <div style={{ padding: '32px' }}>Laden van ritten...</div>;

  const columns = [
    { id: null, name: 'Niet Toegewezen', maxPallets: 999 },
    ...drivers.map(d => ({ 
      id: d.id, 
      name: d.full_name,
      // Simulatie van voertuig capaciteit voor de demo:
      maxPallets: d.id === 'd1000000-0000-0000-0000-000000000001' ? 33 : 15 
    }))
  ];

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Rittenplanning (Masterplan Pro)</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>AI waarschuwt bij overschrijding van pallet-capaciteit.</p>
        </div>
        <button className="btn btn-primary">+ Nieuwe Rit Inplannen</button>
      </div>

      <div className="kanban-board">
        {columns.map(driver => {
          const driverRides = rides.filter(r => r.driver_id === driver.id);
          const totalPallets = driverRides.reduce((sum, r) => sum + (r.pallets_count || 0), 0);
          const isOverCapacity = driver.id !== null && totalPallets > driver.maxPallets;
          
          return (
            <div 
              key={driver.id || 'unassigned'} 
              className="kanban-column"
              style={{ border: isOverCapacity ? '2px solid #ef4444' : '1px solid var(--border-color)' }}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, driver.id)}
            >
              <div className="kanban-header" style={{ backgroundColor: isOverCapacity ? '#fee2e2' : 'transparent', borderRadius: '12px 12px 0 0' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{driver.name}</div>
                  {driver.id !== null && (
                    <div style={{ fontSize: '0.75rem', color: isOverCapacity ? '#ef4444' : 'var(--text-muted)', marginTop: '4px' }}>
                      {totalPallets} / {driver.maxPallets} Pallets
                    </div>
                  )}
                </div>
                <span className="kanban-badge">{driverRides.length}</span>
              </div>
              
              <div className="kanban-cards">
                {driverRides.map(ride => (
                  <div 
                    key={ride.id} 
                    className="ride-card"
                    draggable
                    onDragStart={(e) => onDragStart(e, ride.id)}
                    onDragEnd={onDragEnd}
                    // Touch events for mobile drag-and-drop libraries could be added here
                  >
                    <div className="ride-title">{ride.customers?.company_name || 'Onbekende Klant'}</div>
                    
                    <div className="ride-address">
                      <span style={{ color: 'var(--primary-color)' }}>A</span> 
                      <span>{ride.pickup_address}</span>
                    </div>
                    
                    <div className="ride-address" style={{ marginBottom: 0 }}>
                      <span style={{ color: 'var(--status-delivered)' }}>B</span> 
                      <span>{ride.delivery_address}</span>
                    </div>
                    
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {ride.status === 'geladen' && (
                         <div style={{ backgroundColor: 'var(--status-loaded)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                           Reeds Geladen
                         </div>
                      )}
                      {ride.status === 'afgeleverd' && (
                         <div style={{ backgroundColor: 'var(--status-delivered)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                           Afgeleverd
                         </div>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`http://localhost:3000/track/${ride.id}`);
                          alert('Magic Link gekopieerd! Plak dit in een e-mail naar de klant.');
                        }}
                        style={{ background: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', color: '#0f172a' }}
                      >
                        🔗 Deel Magic Link
                      </button>
                    </div>
                  </div>
                ))}
                
                {driverRides.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '0.875rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                    Sleep een rit hierheen
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
