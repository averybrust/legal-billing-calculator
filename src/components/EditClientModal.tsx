import React, { useState, useEffect } from 'react';
import { database, Client } from '../database';

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ client, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    description: client?.description || '',
    address: client?.address || '',
    contact_name: client?.contact_name || '',
    contact_phone: client?.contact_phone || '',
    contact_email: client?.contact_email || ''
  });
  const [nameExists, setNameExists] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        name: client.name,
        description: client.description || '',
        address: client.address || '',
        contact_name: client.contact_name || '',
        contact_phone: client.contact_phone || '',
        contact_email: client.contact_email || ''
      });
      setNameExists(false);
    }
  }, [client, isOpen]);

  const checkClientNameExists = async (name: string) => {
    if (!name.trim() || !client) {
      setNameExists(false);
      return;
    }
    
    try {
      const exists = await database.clientNameExists(name, client.id);
      setNameExists(exists);
    } catch (error) {
      console.error('Error checking client name:', error);
      setNameExists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || nameExists) return;
    
    try {
      await database.updateClient(client.id, formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, fieldType: 'single' | 'multi') => {
    if (e.key === 'Enter') {
      if (fieldType === 'single') {
        e.preventDefault(); // Prevent form submission
      }
      // For multi-line fields (fieldType === 'multi'), allow natural newline behavior
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        minWidth: '600px',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '24px',
          color: '#111827'
        }}>
          Edit Client
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>
                Client Name: *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData({ ...formData, name: newName });
                  checkClientNameExists(newName);
                }}
                onKeyDown={(e) => handleKeyDown(e, 'single')}
                placeholder="Enter client name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>
                Contact Name:
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 'single')}
                placeholder="Enter contact name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>
                Contact Phone:
              </label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 'single')}
                placeholder="Enter contact phone"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              }}>
                Contact Email:
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 'single')}
                placeholder="Enter contact email"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151'
            }}>
              Description:
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, 'multi')}
              placeholder="Enter client description"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151'
            }}>
              Address:
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, 'multi')}
              placeholder="Enter client address"
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="submit"
                disabled={nameExists}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: nameExists 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  cursor: nameExists ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: nameExists ? 0.6 : 1
                }}
              >
                Update Client
              </button>
              {nameExists && (
                <span style={{
                  color: '#ef4444',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  A client with this name already exists.
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;