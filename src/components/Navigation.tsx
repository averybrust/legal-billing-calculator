import React from 'react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'matters', label: 'Matters', icon: '⚖️' },
    { id: 'timekeepers', label: 'Team', icon: '👥' },
    { id: 'time-entry', label: 'Time Entry', icon: '⏰' },
    { id: 'billing', label: 'Billing', icon: '💰' },
  ];

  return (
    <nav style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fcff 100%)',
      borderBottom: '1px solid #e3f2fd',
      boxShadow: '0 2px 4px rgba(0, 123, 191, 0.08)',
      marginBottom: '0'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px 32px' 
      }}>
        <h1 style={{ 
          margin: '0 0 32px 0', 
          color: '#1a365d',
          fontSize: '28px',
          fontWeight: '600',
          letterSpacing: '-0.5px'
        }}>
          Legal Billing Calculator
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: currentView === item.id ? '#0ea5e9' : 'transparent',
                color: currentView === item.id ? 'white' : '#475569',
                border: currentView === item.id ? 'none' : '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: currentView === item.id 
                  ? '0 4px 12px rgba(14, 165, 233, 0.3)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;