'use client';

import { useState } from 'react';

// Mock Data
const MOCK_DRIVERS = [
  { id: 'unassigned', name: 'Niet Toegewezen' },
  { id: 'driver-1', name: 'Jan Jansen' },
  { id: 'driver-2', name: 'Peter de Vries' },
  { id: 'driver-3', name: 'Klaas Vaak' },
];

const INITIAL_RIDES = [
  { id: 'ride-1', customer: 'Logistics Corp BV', pickup: 'Rotterdam Haven', delivery: 'Amsterdam DC', driverId: 'unassigned', status: 'gepland' },
  { id: 'ride-2', customer: 'MegaStore XL', pickup: 'Utrecht', delivery: 'Den Bosch', driverId: 'driver-1', status: 'gepland' },
  { id: 'ride-3', customer: 'Bouwmaterialen BV', pickup: 'Eindhoven', delivery: 'Tilburg', driverId: 'unassigned', status: 'gepland' },
  { id: 'ride-4', customer: 'FastDeliveries', pickup: 'Schiphol', delivery: 'Groningen', driverId: 'driver-2', status: 'geladen' },
];

export default function PlanningPage() {
  const [rides, setRides] = useState(INITIAL_RIDES);

  const onDragStart = (e: React.DragEvent, rideId: string) => {
    e.dataTransfer.setData('rideId', rideId);
    e.currentTarget.classList.add('dragging');
  };

  const onDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDrop = (e: React.DragEvent, targetDriverId: string) => {
    e.preventDefault();
    const rideId = e.dataTransfer.getData('rideId');
    
    // Update the ride's driverId
    setRides((prevRides) => 
      prevRides.map(ride => 
        ride.id === rideId ? { ...ride, driverId: targetDriverId } : ride
      )
    );
  };

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title">Rittenplanning</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.875rem' }}>Sleep ritten naar chauffeurs om ze in te plannen.</p>
        </div>
        <button className="btn btn-primary">+ Nieuwe Rit Inplannen</button>
      </div>

      <div className="kanban-board">
        {MOCK_DRIVERS.map(driver => {
          const driverRides = rides.filter(r => r.driverId === driver.id);
          
          return (
            <div 
              key={driver.id} 
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
                  >
                    <div className="ride-title">{ride.customer}</div>
                    
                    <div className="ride-address">
                      <span style={{ color: 'var(--primary-color)' }}>A</span> 
                      <span>{ride.pickup}</span>
                    </div>
                    
                    <div className="ride-address" style={{ marginBottom: 0 }}>
                      <span style={{ color: 'var(--status-delivered)' }}>B</span> 
                      <span>{ride.delivery}</span>
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
