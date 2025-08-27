import React, { useState, useRef, useEffect } from 'react';
import { Matter } from '../database';

interface MatterMenuProps {
  matter: Matter;
  onEdit: () => void;
  onStatusChange: (status: 'active' | 'closed' | 'on_hold') => void;
}

const MatterMenu: React.FC<MatterMenuProps> = ({ matter, onEdit, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const getMenuItems = () => {
    switch (matter.status) {
      case 'active':
        return [
          { label: 'Edit Matter', action: onEdit },
          { label: 'Put On Hold', action: () => onStatusChange('on_hold') },
          { label: 'Close Matter', action: () => onStatusChange('closed') }
        ];
      case 'on_hold':
        return [
          { label: 'Edit Matter', action: onEdit },
          { label: 'Reactivate Matter', action: () => onStatusChange('active') },
          { label: 'Close Matter', action: () => onStatusChange('closed') }
        ];
      case 'closed':
        return [
          { label: 'Reopen Matter', action: () => onStatusChange('active') }
        ];
      default:
        return [];
    }
  };

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#666',
          lineHeight: 1
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ⋯
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '150px',
            marginTop: '2px'
          }}
        >
          {getMenuItems().map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.action)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: index < getMenuItems().length - 1 ? '1px solid #eee' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatterMenu;