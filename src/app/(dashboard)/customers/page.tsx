'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ company_name: '', contact_email: '', contact_phone: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('customers').insert([
      { company_name: newCustomer.company_name, contact_email: newCustomer.contact_email, contact_phone: newCustomer.contact_phone }
    ]).select().single();
    
    if (!error && data) {
      setCustomers([data, ...customers]);
      setShowModal(false);
      setNewCustomer({ company_name: '', contact_email: '', contact_phone: '' });
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Klanten laden...</div>;

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Klanten CRM</h2>
          <p style={{ color: 'var(--text-muted)' }}>Beheer alle aangesloten bedrijven en contactpersonen.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nieuwe Klant</button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Bedrijfsnaam</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>E-mail</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Telefoon</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.company_name}</td>
                <td style={{ padding: '12px' }}>{c.contact_email}</td>
                <td style={{ padding: '12px' }}>{c.contact_phone || '-'}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Geen klanten gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '24px' }}>Nieuwe Klant</h2>
            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Bedrijfsnaam</label>
                <input type="text" required value={newCustomer.company_name} onChange={e => setNewCustomer({...newCustomer, company_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>E-mail</label>
                <input type="email" required value={newCustomer.contact_email} onChange={e => setNewCustomer({...newCustomer, contact_email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Telefoon</label>
                <input type="text" value={newCustomer.contact_phone} onChange={e => setNewCustomer({...newCustomer, contact_phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
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
