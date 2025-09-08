import React, { useState, useEffect } from 'react';
import { database, Matter, Client } from '../database';
import EditMatterModal from './EditMatterModal';
import MatterMenu from './MatterMenu';
import { Card, CardContent, CardHeader } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';

const MatterManagement: React.FC = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMatter, setEditingMatter] = useState<Matter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'active' | 'all'>('active');
  const [sortBy, setSortBy] = useState<'recency' | 'client'>('recency');
  const [sectionCollapsed, setSectionCollapsed] = useState({
    active: false,
    on_hold: true,
    closed: true
  });
  const [formData, setFormData] = useState({
    client_id: 0,
    matter_name: '',
    description: '',
    status: 'active' as 'active' | 'closed' | 'on_hold'
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allMatters, allClients] = await Promise.all([
        database.getMatters(),
        database.getClients()
      ]);
      setMatters(allMatters);
      setClients(allClients);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation error
    setValidationError('');
    
    // Validate client selection
    if (!formData.client_id || formData.client_id === 0) {
      setValidationError('Please select a client');
      return;
    }
    
    try {
      await database.createMatter(formData);
      setFormData({
        client_id: 0,
        matter_name: '',
        description: '',
        status: 'active'
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating matter:', error);
      alert('Error creating matter.');
    }
  };

  const handleStatusChange = async (matterId: number, newStatus: 'active' | 'closed' | 'on_hold') => {
    try {
      await database.updateMatter(matterId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Error updating matter status:', error);
      alert('Error updating matter status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'closed': return '#6c757d';
      case 'on_hold': return '#ffc107';
      default: return '#333';
    }
  };

  const filterMatters = () => {
    let filteredMatters = [...matters];

    // Apply search scope filter
    if (searchScope === 'active') {
      filteredMatters = filteredMatters.filter(matter => matter.status === 'active');
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredMatters = filteredMatters.filter(matter => 
        matter.client_name.toLowerCase().includes(query) ||
        matter.matter_name.toLowerCase().includes(query)
      );
    }

    return filteredMatters;
  };

  const sortMatters = (matters: Matter[]) => {
    if (sortBy === 'client') {
      return matters.sort((a, b) => {
        const clientCompare = a.client_name.localeCompare(b.client_name);
        if (clientCompare === 0) {
          // Same client - sort by matter number (most recent first)
          return b.matter_number.localeCompare(a.matter_number);
        }
        return clientCompare;
      });
    } else {
      // Sort by recency (created_at)
      return matters.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  };

  const groupMattersByStatus = () => {
    const filtered = filterMatters();
    const sorted = sortMatters(filtered);
    
    const grouped = {
      active: sorted.filter(m => m.status === 'active'),
      on_hold: sorted.filter(m => m.status === 'on_hold'),
      closed: sorted.filter(m => m.status === 'closed')
    };

    // If searching all matters, return all groups; if searching active only, return only active
    if (searchScope === 'active') {
      return { active: grouped.active, on_hold: [], closed: [] };
    }
    
    return grouped;
  };

  const toggleSection = (status: 'active' | 'on_hold' | 'closed') => {
    setSectionCollapsed(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const toggleAllSections = () => {
    const allCollapsed = Object.values(sectionCollapsed).every(collapsed => collapsed);
    const newState = allCollapsed ? false : true;
    setSectionCollapsed({
      active: newState,
      on_hold: newState,
      closed: newState
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Matter Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            letterSpacing: '-0.2px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
          }}
        >
          {showForm ? 'Cancel' : '+ New Matter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Client:
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
              required
              aria-label="client"
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value={0}>Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {validationError && (
              <div style={{ color: '#ef4444', fontSize: '0.9em', marginTop: '5px' }}>
                {validationError}
              </div>
            )}
            {formData.client_id > 0 && formData.matter_name && (
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                Full matter identifier: {String(matters.filter(m => m.client_id === formData.client_id).length).padStart(4, '0')} - {formData.matter_name}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Matter Name:
            </label>
            <input
              type="text"
              value={formData.matter_name}
              onChange={(e) => setFormData({ ...formData, matter_name: e.target.value })}
              placeholder="Enter matter name"
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="matter-description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
              id="matter-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Status:
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'closed' | 'on_hold' })}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            }}
          >
            Create Matter
          </button>
        </form>
      )}

      {/* Search and Filter Controls */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '15px', alignItems: 'center' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by client or matter name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />

          {/* Search Scope Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Search:</label>
            <select
              value={searchScope}
              onChange={(e) => setSearchScope(e.target.value as 'active' | 'all')}
              style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="active">Active Only</option>
              <option value="all">All Matters</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recency' | 'client')}
              style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="recency">By Recency</option>
              <option value="client">By Client</option>
            </select>
          </div>

          {/* Expand/Collapse All */}
          <button
            onClick={toggleAllSections}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {Object.values(sectionCollapsed).every(collapsed => collapsed) ? 'Expand All' : 'Collapse All'}
          </button>
        </div>
      </div>

      {/* Matters by Status Sections */}
      <div>
        {matters.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No matters created yet.</p>
        ) : (
          (() => {
            const groupedMatters = groupMattersByStatus();
            
            return (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Active Matters Section */}
                {(searchScope === 'all' || searchScope === 'active') && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '10px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                      onClick={() => toggleSection('active')}
                    >
                      <span style={{ fontSize: '18px' }}>
                        {sectionCollapsed.active ? '▶️' : '🔽'}
                      </span>
                      <h3 style={{ margin: 0, color: '#28a745' }}>
                        Active ({groupedMatters.active.length})
                      </h3>
                    </div>
                    
                    {!sectionCollapsed.active && (
                      <div style={{ display: 'grid', gap: '15px', marginLeft: '20px' }}>
                        {groupedMatters.active.length === 0 ? (
                          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                            {searchQuery ? 'No active matters match your search.' : 'No active matters.'}
                          </p>
                        ) : (
                          groupedMatters.active.map((matter) => (
                            <div
                              key={matter.id}
                              style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                                border: '1px solid #e3f2fd',
                                borderRadius: '12px',
                                padding: '20px',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 12px rgba(0, 123, 191, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 123, 191, 0.12), 0 4px 8px rgba(0, 0, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 191, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)';
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ 
                                    margin: '0 0 12px 0',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1a365d',
                                    letterSpacing: '-0.3px'
                                  }}>{matter.client_name}</h4>
                                  <p style={{ 
                                    margin: '0 0 8px 0', 
                                    fontWeight: '500',
                                    fontSize: '15px',
                                    color: '#475569'
                                  }}>
                                    Matter: {matter.matter_number} - {matter.matter_name}
                                  </p>
                                  <p style={{ 
                                    margin: '0 0 12px 0', 
                                    color: '#64748b',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                  }}>
                                    {matter.description}
                                  </p>
                                  <p style={{ 
                                    margin: '0', 
                                    fontSize: '13px', 
                                    color: '#94a3b8',
                                    fontWeight: '500'
                                  }}>
                                    Created: {new Date(matter.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span
                                    style={{
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.8em',
                                      fontWeight: 'bold',
                                      color: 'white',
                                      backgroundColor: getStatusColor(matter.status),
                                      textTransform: 'capitalize'
                                    }}
                                  >
                                    {matter.status.replace('_', ' ')}
                                  </span>
                                  <MatterMenu
                                    matter={matter}
                                    onEdit={() => setEditingMatter(matter)}
                                    onStatusChange={(status) => handleStatusChange(matter.id, status)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* On Hold Matters Section */}
                {searchScope === 'all' && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '10px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                      onClick={() => toggleSection('on_hold')}
                    >
                      <span style={{ fontSize: '18px' }}>
                        {sectionCollapsed.on_hold ? '▶️' : '🔽'}
                      </span>
                      <h3 style={{ margin: 0, color: '#856404' }}>
                        On Hold ({groupedMatters.on_hold.length})
                      </h3>
                    </div>
                    
                    {!sectionCollapsed.on_hold && (
                      <div style={{ display: 'grid', gap: '15px', marginLeft: '20px' }}>
                        {groupedMatters.on_hold.length === 0 ? (
                          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                            {searchQuery ? 'No on-hold matters match your search.' : 'No matters on hold.'}
                          </p>
                        ) : (
                          groupedMatters.on_hold.map((matter) => (
                            <div
                              key={matter.id}
                              style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                                border: '1px solid #e3f2fd',
                                borderRadius: '12px',
                                padding: '20px',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 12px rgba(0, 123, 191, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 123, 191, 0.12), 0 4px 8px rgba(0, 0, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 191, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)';
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ 
                                    margin: '0 0 12px 0',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1a365d',
                                    letterSpacing: '-0.3px'
                                  }}>{matter.client_name}</h4>
                                  <p style={{ 
                                    margin: '0 0 8px 0', 
                                    fontWeight: '500',
                                    fontSize: '15px',
                                    color: '#475569'
                                  }}>
                                    Matter: {matter.matter_number} - {matter.matter_name}
                                  </p>
                                  <p style={{ 
                                    margin: '0 0 12px 0', 
                                    color: '#64748b',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                  }}>
                                    {matter.description}
                                  </p>
                                  <p style={{ 
                                    margin: '0', 
                                    fontSize: '13px', 
                                    color: '#94a3b8',
                                    fontWeight: '500'
                                  }}>
                                    Created: {new Date(matter.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span
                                    style={{
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.8em',
                                      fontWeight: 'bold',
                                      color: 'white',
                                      backgroundColor: getStatusColor(matter.status),
                                      textTransform: 'capitalize'
                                    }}
                                  >
                                    {matter.status.replace('_', ' ')}
                                  </span>
                                  <MatterMenu
                                    matter={matter}
                                    onEdit={() => setEditingMatter(matter)}
                                    onStatusChange={(status) => handleStatusChange(matter.id, status)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Closed Matters Section */}
                {searchScope === 'all' && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '10px',
                        backgroundColor: '#d1ecf1',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                      onClick={() => toggleSection('closed')}
                    >
                      <span style={{ fontSize: '18px' }}>
                        {sectionCollapsed.closed ? '▶️' : '🔽'}
                      </span>
                      <h3 style={{ margin: 0, color: '#0c5460' }}>
                        Closed ({groupedMatters.closed.length})
                      </h3>
                    </div>
                    
                    {!sectionCollapsed.closed && (
                      <div style={{ display: 'grid', gap: '15px', marginLeft: '20px' }}>
                        {groupedMatters.closed.length === 0 ? (
                          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                            {searchQuery ? 'No closed matters match your search.' : 'No closed matters.'}
                          </p>
                        ) : (
                          groupedMatters.closed.map((matter) => (
                            <div
                              key={matter.id}
                              style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                                border: '1px solid #e3f2fd',
                                borderRadius: '12px',
                                padding: '20px',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 12px rgba(0, 123, 191, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 123, 191, 0.12), 0 4px 8px rgba(0, 0, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 191, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)';
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ 
                                    margin: '0 0 12px 0',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1a365d',
                                    letterSpacing: '-0.3px'
                                  }}>{matter.client_name}</h4>
                                  <p style={{ 
                                    margin: '0 0 8px 0', 
                                    fontWeight: '500',
                                    fontSize: '15px',
                                    color: '#475569'
                                  }}>
                                    Matter: {matter.matter_number} - {matter.matter_name}
                                  </p>
                                  <p style={{ 
                                    margin: '0 0 12px 0', 
                                    color: '#64748b',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                  }}>
                                    {matter.description}
                                  </p>
                                  <p style={{ 
                                    margin: '0', 
                                    fontSize: '13px', 
                                    color: '#94a3b8',
                                    fontWeight: '500'
                                  }}>
                                    Created: {new Date(matter.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span
                                    style={{
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.8em',
                                      fontWeight: 'bold',
                                      color: 'white',
                                      backgroundColor: getStatusColor(matter.status),
                                      textTransform: 'capitalize'
                                    }}
                                  >
                                    {matter.status.replace('_', ' ')}
                                  </span>
                                  <MatterMenu
                                    matter={matter}
                                    onEdit={() => setEditingMatter(matter)}
                                    onStatusChange={(status) => handleStatusChange(matter.id, status)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>

      <EditMatterModal
        matter={editingMatter}
        isOpen={editingMatter !== null}
        onClose={() => setEditingMatter(null)}
        onSave={() => loadData()}
      />
    </div>
  );
};

export default MatterManagement;