import React from 'react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'matters', label: 'Matter Management' },
    { id: 'timekeepers', label: 'Timekeeper Setup' },
    { id: 'time-entry', label: 'Time Entry' },
    { id: 'billing', label: 'Billing Summary' },
  ];

  return (
    <nav style={{ padding: '20px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
      <h1 style={{ margin: '0 0 20px 0', color: '#333' }}>Legal Billing Calculator</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === item.id ? '#007bff' : '#f8f9fa',
              color: currentView === item.id ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;