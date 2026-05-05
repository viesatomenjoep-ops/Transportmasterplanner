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
    { id: null, name: 'Niet Toegewezen' },
    ...drivers.map(d => ({ id: d.id, name: d.full_name }))
  ];

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Rittenplanning (Live)</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Sleep ritten naar chauffeurs om ze in te plannen.</p>
        </div>
        <button className="btn btn-primary">+ Nieuwe Rit Inplannen</button>
      </div>

      <div className="kanban-board">
        {columns.map(driver => {
          const driverRides = rides.filter(r => r.driver_id === driver.id);
          
          return (
            <div 
              key={driver.id || 'unassigned'} 
              className="kanban-column"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, driver.id)}
            >
              <div className="kanban-header">
                <span>{driver.name}</span>
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
                    
                    {ride.status === 'geladen' && (
                       <div style={{ marginTop: '12px', display: 'inline-block', backgroundColor: 'var(--status-loaded)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                         Reeds Geladen
                       </div>
                    )}
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
