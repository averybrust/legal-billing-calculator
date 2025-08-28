import React, { useState, useEffect } from 'react';
import { database, TimeEntry, Matter, Timekeeper } from '../database';

interface EditTimeEntryModalProps {
  timeEntry: (TimeEntry & { timekeeper_name: string; client_name: string; matter_number: string; matter_name: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditTimeEntryModal: React.FC<EditTimeEntryModalProps> = ({
  timeEntry,
  isOpen,
  onClose,
  onSave
}) => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [timekeepers, setTimekeepers] = useState<Timekeeper[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    timekeeper_id: 0,
    matter_id: 0,
    hours: '',
    description: '',
    is_billable: true,
    override_rate: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (timeEntry) {
        setFormData({
          date: timeEntry.date,
          timekeeper_id: timeEntry.timekeeper_id,
          matter_id: timeEntry.matter_id,
          hours: timeEntry.hours.toString(),
          description: timeEntry.description,
          is_billable: timeEntry.is_billable,
          override_rate: timeEntry.override_rate?.toString() || ''
        });
      }
    }
  }, [isOpen, timeEntry]);

  const loadData = async () => {
    try {
      const [allMatters, allTimekeepers] = await Promise.all([
        database.getMatters(),
        database.getTimekeepers()
      ]);
      setMatters(allMatters.filter(m => m.status === 'active'));
      setTimekeepers(allTimekeepers);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeEntry) return;

    try {
      const updates: Partial<TimeEntry> = {
        date: formData.date,
        timekeeper_id: formData.timekeeper_id,
        matter_id: formData.matter_id,
        hours: parseFloat(formData.hours),
        description: formData.description,
        is_billable: formData.is_billable,
        override_rate: formData.override_rate ? parseFloat(formData.override_rate) : undefined
      };

      await database.updateTimeEntry(timeEntry.id, updates);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating time entry:', error);
      alert('Error updating time entry.');
    }
  };

  const handleDelete = async () => {
    if (!timeEntry) return;
    
    if (window.confirm('Are you sure you want to delete this time entry? This action cannot be undone.')) {
      try {
        await database.deleteTimeEntry(timeEntry.id);
        onSave();
        onClose();
      } catch (error) {
        console.error('Error deleting time entry:', error);
        alert('Error deleting time entry.');
      }
    }
  };

  const getSelectedTimekeeper = () => {
    return timekeepers.find(t => t.id === formData.timekeeper_id);
  };

  const getSelectedMatter = () => {
    return matters.find(m => m.id === formData.matter_id);
  };

  const calculateRate = () => {
    if (formData.override_rate) {
      return parseFloat(formData.override_rate);
    }
    
    const timekeeper = getSelectedTimekeeper();
    const matter = getSelectedMatter();
    
    if (!timekeeper || !matter) return 0;
    
    return timekeeper.standard_rate;
  };

  const calculateAmount = () => {
    const hours = parseFloat(formData.hours) || 0;
    const rate = calculateRate();
    return hours * rate;
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2>Edit Time Entry</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Timekeeper:
            </label>
            <select
              value={formData.timekeeper_id}
              onChange={(e) => setFormData({ ...formData, timekeeper_id: parseInt(e.target.value) })}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select timekeeper</option>
              {timekeepers.map((timekeeper) => (
                <option key={timekeeper.id} value={timekeeper.id}>
                  {timekeeper.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Matter:
            </label>
            <select
              value={formData.matter_id}
              onChange={(e) => setFormData({ ...formData, matter_id: parseInt(e.target.value) })}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select matter</option>
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.client_name} - {matter.matter_number} - {matter.matter_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Hours:
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="Hours worked"
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Work description"
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
              Billable:
            </label>
            <select
              value={formData.is_billable ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_billable: e.target.value === 'true' })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Rate Override (optional):
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.override_rate}
              onChange={(e) => setFormData({ ...formData, override_rate: e.target.value })}
              placeholder="Override rate"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          {formData.hours && formData.timekeeper_id && formData.matter_id && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '0.9em'
            }}>
              <strong>Preview:</strong><br />
              Rate: ${calculateRate().toFixed(2)}/hour<br />
              Amount: ${calculateAmount().toFixed(2)}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete Entry
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTimeEntryModal;