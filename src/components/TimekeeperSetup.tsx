import React, { useState, useEffect } from 'react';
import { database, Timekeeper } from '../database';

const TimekeeperSetup: React.FC = () => {
  const [timekeepers, setTimekeepers] = useState<Timekeeper[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rate_tier: 'junior_associate' as 'partner' | 'senior_associate' | 'junior_associate' | 'paralegal',
    standard_rate: ''
  });

  useEffect(() => {
    loadTimekeepers();
  }, []);

  const loadTimekeepers = async () => {
    try {
      const allTimekeepers = await database.getTimekeepers();
      setTimekeepers(allTimekeepers);
    } catch (error) {
      console.error('Error loading timekeepers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await database.createTimekeeper({
        name: formData.name,
        rate_tier: formData.rate_tier,
        standard_rate: parseFloat(formData.standard_rate)
      });
      setFormData({
        name: '',
        rate_tier: 'junior_associate',
        standard_rate: ''
      });
      setShowForm(false);
      loadTimekeepers();
    } catch (error) {
      console.error('Error creating timekeeper:', error);
      alert('Error creating timekeeper.');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'partner': return '#6f42c1';
      case 'senior_associate': return '#007bff';
      case 'junior_associate': return '#28a745';
      case 'paralegal': return '#ffc107';
      default: return '#333';
    }
  };

  const formatTierName = (tier: string) => {
    return tier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Timekeeper Setup</h2>
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
          {showForm ? 'Cancel' : 'New Timekeeper'}
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
              Name:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter timekeeper name"
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
              Rate Tier:
            </label>
            <select
              value={formData.rate_tier}
              onChange={(e) => setFormData({ ...formData, rate_tier: e.target.value as any })}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="paralegal">Paralegal</option>
              <option value="junior_associate">Junior Associate</option>
              <option value="senior_associate">Senior Associate</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Standard Hourly Rate ($):
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.standard_rate}
              onChange={(e) => setFormData({ ...formData, standard_rate: e.target.value })}
              required
              placeholder="Enter hourly rate"
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
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
            Add Timekeeper
          </button>
        </form>
      )}

      <div>
        <h3>Current Timekeepers</h3>
        {timekeepers.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No timekeepers added yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {timekeepers.map((timekeeper) => (
              <div
                key={timekeeper.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{timekeeper.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8em',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getTierColor(timekeeper.rate_tier)
                      }}
                    >
                      {formatTierName(timekeeper.rate_tier)}
                    </span>
                    <span style={{ fontSize: '0.9em', color: '#666' }}>
                      Added: {new Date(timekeeper.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28a745' }}>
                    ${timekeeper.standard_rate}/hr
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimekeeperSetup;