import React, { useState, useEffect, useRef } from 'react';

interface ClientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  clients: string[];
  placeholder?: string;
  required?: boolean;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  value,
  onChange,
  clients,
  placeholder,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = clients.filter(client =>
        client.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClients(filtered);
      setIsOpen(filtered.length > 0 && value !== '');
    } else {
      setFilteredClients([]);
      setIsOpen(false);
    }
  }, [value, clients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleClientSelect = (client: string) => {
    onChange(client);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (filteredClients.length > 0 && value) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px'
        }}
      />

      {isOpen && filteredClients.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {filteredClients.map((client, index) => (
            <div
              key={index}
              onClick={() => handleClientSelect(client)}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                borderBottom: index < filteredClients.length - 1 ? '1px solid #eee' : 'none',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {client}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                Existing client
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientAutocomplete;