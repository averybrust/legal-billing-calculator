import React, { useState, useEffect } from 'react';
import { database, Client } from '../database';
import EditClientModal from './EditClientModal';

interface ClientFormData {
  name: string;
  description: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created'>('name');
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    description: '',
    address: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState<number | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState<Client | null>(null);
  const [clientMattersCount, setClientMattersCount] = useState<number>(0);
  const [nameExists, setNameExists] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, [sortBy]);

  const loadClients = async () => {
    try {
      if (searchQuery.trim()) {
        const results = await database.searchClients(searchQuery);
        setClients(results);
      } else {
        const results = await database.getClientsSorted(sortBy);
        setClients(results);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      if (query.trim()) {
        const results = await database.searchClients(query);
        setClients(results);
      } else {
        const results = await database.getClientsSorted(sortBy);
        setClients(results);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  };

  const checkClientNameExists = async (name: string) => {
    if (!name.trim()) {
      setNameExists(false);
      return;
    }
    
    try {
      const exists = await database.clientNameExists(name);
      setNameExists(exists);
    } catch (error) {
      console.error('Error checking client name:', error);
      setNameExists(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setEditModalOpen(true);
    setContextMenuOpen(null);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setClientToEdit(null);
  };

  const handleEditModalSave = async () => {
    await loadClients();
  };

  const handleKeyDown = (e: React.KeyboardEvent, fieldType: 'single' | 'multi') => {
    if (e.key === 'Enter') {
      if (fieldType === 'single') {
        e.preventDefault(); // Prevent form submission
      }
      // For multi-line fields (fieldType === 'multi'), allow natural newline behavior
    }
  };

  const handleSortChange = (newSortBy: 'name' | 'created') => {
    setSortBy(newSortBy);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return; // Form validation handled by HTML required attribute
    }

    try {
      await database.createClient(formData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        contact_name: '',
        contact_phone: '',
        contact_email: ''
      });
      setNameExists(false);
      setIsFormOpen(false);
      
      // Reload clients
      await loadClients();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      // Get matters count for confirmation dialog
      const matters = await database.getMattersForClient(client.id);
      setClientMattersCount(matters.length);
      setDeleteConfirmationOpen(client);
      setContextMenuOpen(null);
    } catch (error) {
      console.error('Error checking client matters:', error);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmationOpen) {
      try {
        await database.deleteClient(deleteConfirmationOpen.id);
        setDeleteConfirmationOpen(null);
        await loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
          Client Management
        </h1>
        <button
          onClick={() => setIsFormOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
          }}
        >
          + New Client
        </button>
      </div>

      {/* New Client Form */}
      {isFormOpen && (
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
              Client Management
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleFormSubmit}>
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
                  Description:
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, 'multi')}
                  placeholder="Enter client description"
                  rows={4}
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
                  Address:
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, 'multi')}
                  placeholder="Enter client address"
                  rows={4}
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="submit"
                disabled={nameExists}
                style={{
                  background: nameExists 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: nameExists ? 'not-allowed' : 'pointer',
                  boxShadow: nameExists 
                    ? 'none' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: nameExists ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!nameExists) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!nameExists) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                Create Client
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
          </form>
        </div>
      )}

      {/* Search and Sort Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f9fafb'
            }}
          />
          <svg 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: 600,
            color: '#374151'
          }}>
            Sort:
          </label>
          <select
            value={sortBy === 'name' ? 'name' : 'created'}
            onChange={(e) => handleSortChange(e.target.value as 'name' | 'created')}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer'
            }}
          >
            <option value="name">By Name</option>
            <option value="created">By Date Created</option>
          </select>
        </div>
      </div>

      {/* Client List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clients.map((client) => (
          <div
            key={client.id}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  margin: '0 0 8px 0'
                }}>
                  {client.name}
                </h3>
                <p style={{ 
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  Created: {formatDate(client.created_at)}
                </p>
              </div>
              
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setContextMenuOpen(contextMenuOpen === client.id ? null : client.id)}
                  aria-label="more options"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    color: '#6b7280',
                    fontSize: '18px',
                    lineHeight: 1
                  }}
                >
                  ⋯
                </button>
                
                {contextMenuOpen === client.id && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    minWidth: '140px'
                  }}>
                    <button
                      onClick={() => handleEditClient(client)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#374151',
                        borderRadius: '8px 8px 0 0'
                      }}
                    >
                      Edit Client
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#ef4444',
                        borderRadius: '0 0 8px 8px'
                      }}
                    >
                      Delete Client
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          {searchQuery ? 'No clients found matching your search.' : 'No clients yet. Create your first client to get started.'}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmationOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: '#1a1a1a',
              margin: '0 0 12px 0'
            }}>
              Delete Client
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              This will permanently delete "{deleteConfirmationOpen.name}".
            </p>
            {clientMattersCount > 0 && (
              <p style={{ 
                fontSize: '14px',
                color: '#ef4444',
                margin: '0 0 8px 0',
                fontWeight: 600
              }}>
                This will also delete {clientMattersCount} associated matter{clientMattersCount === 1 ? '' : 's'}.
              </p>
            )}
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmationOpen(null)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <EditClientModal
        client={clientToEdit}
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        onSave={handleEditModalSave}
      />
    </div>
  );
};

export default ClientManagement;