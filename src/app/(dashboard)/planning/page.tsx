'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PlanningPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newRide, setNewRide] = useState({
    customer_id: '',
    pickup_address: '',
    delivery_address: '',
    pallets_count: 0,
    total_weight_kg: 0,
    transport_mode: 'road',
    requires_customs: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: driversData } = await supabase.from('drivers').select('*').eq('is_active', true);
    const { data: ridesData } = await supabase.from('rides').select('*, customers(company_name)');
    const { data: customersData } = await supabase.from('customers').select('*');

    if (driversData) setDrivers(driversData);
    if (ridesData) setRides(ridesData);
    if (customersData) {
      setCustomers(customersData);
      if (customersData.length > 0) setNewRide(prev => ({ ...prev, customer_id: customersData[0].id }));
    }
    setLoading(false);
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRide.customer_id) return alert('Selecteer een klant');
    
    const { data, error } = await supabase.from('rides').insert([
      {
        customer_id: newRide.customer_id,
        pickup_address: newRide.pickup_address,
        delivery_address: newRide.delivery_address,
        pallets_count: newRide.pallets_count,
        total_weight_kg: newRide.total_weight_kg,
        transport_mode: newRide.transport_mode,
        requires_customs: newRide.requires_customs,
        status: 'gepland'
      }
    ]).select('*, customers(company_name)').single();
    
    if (error) {
      console.error(error);
      alert('Fout bij aanmaken rit');
    } else if (data) {
      setRides([...rides, data]);
      setShowModal(false);
      setNewRide({ customer_id: customers[0]?.id || '', pickup_address: '', delivery_address: '', pallets_count: 0, total_weight_kg: 0, transport_mode: 'road', requires_customs: false });
    }
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nieuwe Rit Inplannen</button>
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

      {/* Modal voor nieuwe rit */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '24px' }}>Nieuwe Rit Aanmaken</h2>
            <form onSubmit={handleCreateRide} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Klant</label>
                <select 
                  value={newRide.customer_id} 
                  onChange={e => setNewRide({...newRide, customer_id: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                >
                  <option value="" disabled>Selecteer klant...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ophaal Adres</label>
                <input type="text" required value={newRide.pickup_address} onChange={e => setNewRide({...newRide, pickup_address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Bijv. Haven Rotterdam" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Aflever Adres</label>
                <input type="text" required value={newRide.delivery_address} onChange={e => setNewRide({...newRide, delivery_address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Bijv. Distributiecentrum Amsterdam" />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Pallets</label>
                  <input type="number" min="0" required value={newRide.pallets_count} onChange={e => setNewRide({...newRide, pallets_count: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gewicht (kg)</label>
                  <input type="number" min="0" required value={newRide.total_weight_kg} onChange={e => setNewRide({...newRide, total_weight_kg: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Transport Mode</label>
                  <select value={newRide.transport_mode} onChange={e => setNewRide({...newRide, transport_mode: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="road">Wegtransport (Road)</option>
                    <option value="sea">Zeevracht (Sea)</option>
                    <option value="air">Luchtvracht (Air)</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                  <input type="checkbox" id="douane" checked={newRide.requires_customs} onChange={e => setNewRide({...newRide, requires_customs: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                  <label htmlFor="douane" style={{ fontWeight: 'bold', color: '#ef4444' }}>Douane vereist?</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#000' }}>Annuleer</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Aanmaken</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
