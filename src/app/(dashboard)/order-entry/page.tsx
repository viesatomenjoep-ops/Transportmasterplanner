'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OrderEntryPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [order, setOrder] = useState({
    customer_id: '',
    pickup_address: '',
    delivery_address: '',
    pallets_count: 0,
    total_weight_kg: 0,
    transport_mode: 'road',
    requires_customs: false,
    temperature_required: '',
    eta: '',
    estimated_cost: '',
    adr_certified: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('customers').select('*');
    if (data) setCustomers(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.customer_id) return alert('Selecteer een klant!');

    const { error } = await supabase.from('rides').insert([{
      ...order,
      temperature_required: order.temperature_required ? parseFloat(order.temperature_required) : null,
      estimated_cost: order.estimated_cost ? parseFloat(order.estimated_cost) : null,
      eta: order.eta || null,
      status: 'gepland'
    }]);

    if (error) {
      alert('Fout bij aanmaken order: ' + error.message);
    } else {
      alert('Order succesvol aangemaakt! Ligt nu op het Planbord.');
      setOrder({
        customer_id: '', pickup_address: '', delivery_address: '', pallets_count: 0, total_weight_kg: 0, 
        transport_mode: 'road', requires_customs: false, temperature_required: '', eta: '', estimated_cost: '', adr_certified: false
      });
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Laden...</div>;

  return (
    <div className="content-area animate-slide-up">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Advanced Order Entry (Heppner Pro)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Maak complexe transportorders aan inclusief douane, koeltransport en ADR.</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Klant & Basis */}
        <div style={{ gridColumn: '1 / -1', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px' }}>1. Klant & Adressen</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Opdrachtgever</label>
              <select required value={order.customer_id} onChange={e => setOrder({...order, customer_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="" disabled>Selecteer klant...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ophaaladres</label>
              <input type="text" required value={order.pickup_address} onChange={e => setOrder({...order, pickup_address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Afleveradres</label>
              <input type="text" required value={order.delivery_address} onChange={e => setOrder({...order, delivery_address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
        </div>

        {/* Lading & Capaciteit */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>2. Lading Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Aantal Pallets</label>
              <input type="number" min="0" required value={order.pallets_count} onChange={e => setOrder({...order, pallets_count: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Totaal Gewicht (kg)</label>
              <input type="number" min="0" required value={order.total_weight_kg} onChange={e => setOrder({...order, total_weight_kg: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Verwachte Levertijd (ETA)</label>
              <input type="datetime-local" value={order.eta} onChange={e => setOrder({...order, eta: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Kostprijs / Tarief (€)</label>
              <input type="number" step="0.01" value={order.estimated_cost} onChange={e => setOrder({...order, estimated_cost: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* Heppner Enterprise Requirements */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>3. Logistieke Vereisten</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Transport Modaliteit</label>
              <select value={order.transport_mode} onChange={e => setOrder({...order, transport_mode: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="road">Wegtransport (Road)</option>
                <option value="sea">Zeevracht (Sea)</option>
                <option value="air">Luchtvracht (Air)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gekoeld Transport (°C)</label>
              <input type="number" step="0.1" value={order.temperature_required} onChange={e => setOrder({...order, temperature_required: e.target.value})} placeholder="-18.0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#ef4444' }}>
                <input type="checkbox" checked={order.requires_customs} onChange={e => setOrder({...order, requires_customs: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                Douane Documenten Vereist?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#f59e0b' }}>
                <input type="checkbox" checked={order.adr_certified} onChange={e => setOrder({...order, adr_certified: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                ADR (Gevaarlijke Stoffen)?
              </label>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
          <button type="submit" className="btn-massive btn-blue" style={{ width: '100%' }}>Bevestig Transport Order (Boeken)</button>
        </div>
      </form>
    </div>
  );
}
