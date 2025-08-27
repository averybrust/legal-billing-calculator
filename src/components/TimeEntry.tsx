import React, { useState, useEffect, useCallback } from 'react';
import { database, Matter, Timekeeper, TimeEntry as TimeEntryType } from '../database';

const TimeEntry: React.FC = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [timekeepers, setTimekeepers] = useState<Timekeeper[]>([]);
  const [timeEntries, setTimeEntries] = useState<(TimeEntryType & { timekeeper_name: string; client_name: string; matter_number: string })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    matter_id: '',
    timekeeper_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    is_billable: true,
    override_rate: ''
  });
  const [calculatedRate, setCalculatedRate] = useState<number>(0);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  const loadData = async () => {
    try {
      const [allMatters, allTimekeepers, allTimeEntries] = await Promise.all([
        database.getMatters(),
        database.getTimekeepers(),
        database.getTimeEntries()
      ]);
      setMatters(allMatters.filter(m => m.status === 'active'));
      setTimekeepers(allTimekeepers);
      setTimeEntries(allTimeEntries);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Refresh data when component becomes visible (simple approach)
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const calculateAmount = useCallback(async () => {
    if (!formData.timekeeper_id || !formData.matter_id || !formData.hours) {
      setCalculatedRate(0);
      setCalculatedAmount(0);
      return;
    }

    try {
      const timekeeper = timekeepers.find(t => t.id === parseInt(formData.timekeeper_id));
      if (!timekeeper) return;

      let rate = timekeeper.standard_rate;

      if (formData.override_rate) {
        rate = parseFloat(formData.override_rate);
      } else {
        const matterRate = await database.getMatterRate(parseInt(formData.matter_id), parseInt(formData.timekeeper_id));
        if (matterRate) {
          rate = matterRate.override_rate;
        }
      }

      setCalculatedRate(rate);
      setCalculatedAmount(parseFloat(formData.hours) * rate);
    } catch (error) {
      console.error('Error calculating amount:', error);
    }
  }, [formData.timekeeper_id, formData.matter_id, formData.hours, formData.override_rate, timekeepers]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateAmount();
  }, [calculateAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await database.createTimeEntry({
        matter_id: parseInt(formData.matter_id),
        timekeeper_id: parseInt(formData.timekeeper_id),
        date: formData.date,
        hours: parseFloat(formData.hours),
        description: formData.description,
        is_billable: formData.is_billable,
        override_rate: formData.override_rate ? parseFloat(formData.override_rate) : undefined
      });

      setFormData({
        matter_id: '',
        timekeeper_id: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        is_billable: true,
        override_rate: ''
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating time entry:', error);
      alert('Error creating time entry.');
    }
  };

  const roundToIncrement = (value: number, increment: number) => {
    return Math.round(value / increment) * increment;
  };

  const handleQuickTime = (increment: number) => {
    const currentHours = parseFloat(formData.hours) || 0;
    const newHours = roundToIncrement(currentHours + increment, increment);
    setFormData({ ...formData, hours: newHours.toString() });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Time Entry</h2>
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
          {showForm ? 'Cancel' : 'New Time Entry'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date:
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Timekeeper:
              </label>
              <select
                value={formData.timekeeper_id}
                onChange={(e) => setFormData({ ...formData, timekeeper_id: e.target.value })}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              >
                <option value="">Select Timekeeper</option>
                {timekeepers.map((timekeeper) => (
                  <option key={timekeeper.id} value={timekeeper.id}>
                    {timekeeper.name} (${timekeeper.standard_rate}/hr)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Matter:
            </label>
            <select
              value={formData.matter_id}
              onChange={(e) => setFormData({ ...formData, matter_id: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="">Select Matter</option>
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.client_name} - {matter.matter_number}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Hours:
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                required
                placeholder="Enter hours (decimal)"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Quick Add:
              </label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickTime(0.25)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  +0.25
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTime(0.1)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  +0.1
                </button>
              </div>
            </div>
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
              placeholder="Describe the work performed"
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={formData.is_billable}
                  onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                />
                <span style={{ fontWeight: 'bold' }}>Billable Time</span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Override Rate ($/hr):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.override_rate}
                onChange={(e) => setFormData({ ...formData, override_rate: e.target.value })}
                placeholder="Leave blank for standard rate"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              />
            </div>
          </div>

          {formData.is_billable && calculatedRate > 0 && (
            <div style={{
              backgroundColor: '#e7f3ff',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Calculation Preview:</h4>
              <p style={{ margin: '0 0 5px 0' }}>
                Rate: ${calculatedRate.toFixed(2)}/hr
              </p>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1em' }}>
                Total: ${calculatedAmount.toFixed(2)}
              </p>
            </div>
          )}

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
            Add Time Entry
          </button>
        </form>
      )}

      <div>
        <h3>Recent Time Entries</h3>
        {timeEntries.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No time entries recorded yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {timeEntries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>{entry.timekeeper_name}</span>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.8em',
                        backgroundColor: entry.is_billable ? '#28a745' : '#6c757d',
                        color: 'white'
                      }}>
                        {entry.is_billable ? 'Billable' : 'Non-Billable'}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.9em' }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px', fontSize: '0.9em', color: '#666' }}>
                      {entry.client_name} - {entry.matter_number}
                    </div>
                    <div style={{ fontSize: '0.9em' }}>
                      {entry.description}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                      {entry.hours} hrs
                    </div>
                    {entry.is_billable && (
                      <div style={{ color: '#28a745', fontSize: '0.9em' }}>
                        ${entry.override_rate || 'Standard'}/hr
                      </div>
                    )}
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

export default TimeEntry;