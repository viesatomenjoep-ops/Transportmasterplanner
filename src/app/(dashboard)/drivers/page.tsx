'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ full_name: '', phone_number: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    const { data } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
    if (data) setDrivers(data);
    setLoading(false);
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('drivers').insert([
      { full_name: newDriver.full_name, phone_number: newDriver.phone_number, is_active: true }
    ]).select().single();
    
    if (!error && data) {
      setDrivers([data, ...drivers]);
      setShowModal(false);
      setNewDriver({ full_name: '', phone_number: '' });
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Chauffeurs laden...</div>;

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Chauffeurs Beheer</h2>
          <p style={{ color: 'var(--text-muted)' }}>Beheer chauffeurs, rij-uren en actieve statussen.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nieuwe Chauffeur</button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Naam</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Telefoon</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Rijuren Vandaag</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{driver.full_name}</td>
                <td style={{ padding: '12px' }}>{driver.phone_number || '-'}</td>
                <td style={{ padding: '12px' }}>{driver.driving_hours_today || 0} uur</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ backgroundColor: driver.is_active ? '#dcfce7' : '#fee2e2', color: driver.is_active ? '#166534' : '#991b1b', padding: '4px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {driver.is_active ? 'Actief' : 'Inactief'}
                  </span>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Geen chauffeurs gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '24px' }}>Nieuwe Chauffeur</h2>
            <form onSubmit={handleCreateDriver} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Volledige Naam</label>
                <input type="text" required value={newDriver.full_name} onChange={e => setNewDriver({...newDriver, full_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Telefoonnummer</label>
                <input type="text" value={newDriver.phone_number} onChange={e => setNewDriver({...newDriver, phone_number: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
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
