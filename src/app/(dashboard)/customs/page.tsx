'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CustomsPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomsRides();
  }, []);

  const fetchCustomsRides = async () => {
    setLoading(true);
    // Haal alle ritten op (we filteren ze hier op vereiste douane of zee/lucht)
    const { data } = await supabase
      .from('rides')
      .select('*, customers(company_name)');
    
    // Voor de demo simuleren we dat de eerste rit douaneplichtig is
    if (data && data.length > 0 && !data[0].requires_customs) {
       await supabase.from('rides').update({ requires_customs: true, transport_mode: 'sea' }).eq('id', data[0].id);
       data[0].requires_customs = true;
       data[0].transport_mode = 'sea';
    }
    
    if (data) setRides(data.filter(r => r.requires_customs || r.transport_mode === 'sea' || r.transport_mode === 'air'));
    setLoading(false);
  };

  const generateMRN = async (rideId: string) => {
    const fakeMRN = `23NL${Math.floor(100000 + Math.random() * 900000)}ABCD`;
    
    await supabase.from('customs_documents').insert({
      ride_id: rideId,
      document_type: 'T1',
      document_number: fakeMRN,
      status: 'cleared'
    });
    
    alert(`Douanedocument ${fakeMRN} gegenereerd en vrijgegeven! Chauffeur kan nu laden.`);
  };

  if (loading) return <div style={{ padding: '32px' }}>Douane data laden...</div>;

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Douane & Overseas (Heppner Module)</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Beheer douanedocumenten voor internationale en zee/luchtvracht.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {rides.map(ride => (
          <div key={ride.id} className="card" style={{ borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontWeight: 'bold' }}>{ride.customers?.company_name}</span>
              <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {ride.transport_mode === 'sea' ? '🚢 ZEEVRACHT' : ride.transport_mode === 'air' ? '✈️ LUCHTVRACHT' : '🚚 INTERNATIONAAL'}
              </span>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Van: {ride.pickup_address}<br/>
              Naar: {ride.delivery_address}
            </p>
            
            <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Douanestatus</div>
              <div style={{ fontWeight: 'bold', color: '#ef4444' }}>🔴 Document Vereist (T1)</div>
            </div>

            <button 
              onClick={() => generateMRN(ride.id)}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'auto' }}
            >
              📄 Genereer & Vrijgeven (MRN)
            </button>
          </div>
        ))}
        
        {rides.length === 0 && (
          <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', color: 'var(--text-muted)' }}>
            Geen douaneplichtige ritten gevonden.
          </div>
        )}
      </div>
    </div>
  );
}
