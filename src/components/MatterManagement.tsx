import React, { useState, useEffect } from 'react';
import { database, Matter } from '../database';
import EditMatterModal from './EditMatterModal';
import MatterMenu from './MatterMenu';
import ClientAutocomplete from './ClientAutocomplete';

const MatterManagement: React.FC = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMatter, setEditingMatter] = useState<Matter | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    description: '',
    status: 'active' as 'active' | 'closed' | 'on_hold'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allMatters, allClients] = await Promise.all([
        database.getMatters(),
        database.getUniqueClients()
      ]);
      setMatters(allMatters);
      setClients(allClients);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await database.createMatter(formData);
      setFormData({
        client_name: '',
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Matter Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'New Matter'}
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
              Client Name:
            </label>
            <ClientAutocomplete
              value={formData.client_name}
              onChange={(value) => setFormData({ ...formData, client_name: value })}
              clients={clients}
              placeholder="Enter client name (existing clients will show in dropdown)"
              required
            />
            {formData.client_name && (
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                Matter number will be auto-assigned: {formData.client_name} - {String(matters.filter(m => m.client_name === formData.client_name).length).padStart(4, '0')}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
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
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create Matter
          </button>
        </form>
      )}

      <div>
        <h3>Existing Matters</h3>
        {matters.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No matters created yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {matters.map((matter) => (
              <div
                key={matter.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{matter.client_name}</h4>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                      Matter: {matter.matter_number}
                    </p>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                      {matter.description}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>
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
            ))}
          </div>
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