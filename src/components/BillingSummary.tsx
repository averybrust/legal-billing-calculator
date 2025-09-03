import React, { useState, useEffect } from 'react';
import { database, Matter } from '../database';

interface BillingSummaryData {
  total_billable_hours: number;
  total_non_billable_hours: number;
  total_billable_amount: number;
  timekeeper_breakdown: {
    timekeeper_name: string;
    billable_hours: number;
    billable_amount: number;
    rate_used: number;
  }[];
}

const BillingSummary: React.FC = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedMatter, setSelectedMatter] = useState<string>('');
  const [summary, setSummary] = useState<BillingSummaryData | null>(null);

  useEffect(() => {
    loadMatters();
  }, []);

  useEffect(() => {
    if (selectedMatter) {
      loadSummary(parseInt(selectedMatter));
    } else {
      setSummary(null);
    }
  }, [selectedMatter]);

  const loadMatters = async () => {
    try {
      const allMatters = await database.getMatters();
      setMatters(allMatters);
    } catch (error) {
      console.error('Error loading matters:', error);
    }
  };

  // Refresh data when component becomes visible (simple approach)
  useEffect(() => {
    const handleFocus = () => {
      loadMatters();
      if (selectedMatter) {
        loadSummary(parseInt(selectedMatter));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedMatter]);

  const loadSummary = async (matterId: number) => {
    try {
      const billingSummary = await database.getBillingSummary(matterId);
      setSummary(billingSummary);
    } catch (error) {
      console.error('Error loading billing summary:', error);
    }
  };

  const generateInvoice = () => {
    if (!summary || !selectedMatter) return;

    const matter = matters.find(m => m.id === parseInt(selectedMatter));
    if (!matter) return;

    const invoiceContent = `
LEGAL SERVICES INVOICE

Client: ${matter.client_name}
Matter: ${matter.matter_number}
Description: ${matter.description}
Date: ${new Date().toLocaleDateString()}

---

BILLING SUMMARY:
Total Billable Hours: ${summary.total_billable_hours.toFixed(2)}
Total Non-Billable Hours: ${summary.total_non_billable_hours.toFixed(2)}

TIMEKEEPER BREAKDOWN:
${summary.timekeeper_breakdown.map(tk => 
  `${tk.timekeeper_name}: ${tk.billable_hours.toFixed(2)} hrs @ $${tk.rate_used.toFixed(2)}/hr = $${tk.billable_amount.toFixed(2)}`
).join('\n')}

---

TOTAL AMOUNT DUE: $${summary.total_billable_amount.toFixed(2)}
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${matter.matter_number}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedMatterData = matters.find(m => m.id === parseInt(selectedMatter));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Billing Summary</h2>
        {summary && (
          <button
            onClick={generateInvoice}
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
            Generate Invoice
          </button>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Select Matter:
        </label>
        <select
          value={selectedMatter}
          onChange={(e) => setSelectedMatter(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          <option value="">Choose a matter to view billing summary</option>
          {matters.map((matter) => (
            <option key={matter.id} value={matter.id}>
              {matter.client_name} - {matter.matter_number}
            </option>
          ))}
        </select>
      </div>

      {selectedMatterData && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Matter Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Client:</strong> {selectedMatterData.client_name}
            </div>
            <div>
              <strong>Matter Number:</strong> {selectedMatterData.matter_number}
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>Description:</strong> {selectedMatterData.description}
            </div>
            <div>
              <strong>Status:</strong> 
              <span style={{ 
                marginLeft: '10px',
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.8em',
                backgroundColor: selectedMatterData.status === 'active' ? '#28a745' : '#6c757d',
                color: 'white'
              }}>
                {selectedMatterData.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <strong>Created:</strong> {new Date(selectedMatterData.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {summary ? (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            <div style={{ 
              backgroundColor: '#e7f3ff', 
              padding: '20px', 
              borderRadius: '4px', 
              textAlign: 'center' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Billable Hours</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
                {summary.total_billable_hours.toFixed(2)}
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#fff3cd', 
              padding: '20px', 
              borderRadius: '4px', 
              textAlign: 'center' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>Non-Billable Hours</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
                {summary.total_non_billable_hours.toFixed(2)}
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#d4edda', 
              padding: '20px', 
              borderRadius: '4px', 
              textAlign: 'center' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>Total Amount</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
                ${summary.total_billable_amount.toFixed(2)}
              </div>
            </div>
          </div>

          {summary.timekeeper_breakdown.length > 0 && (
            <div>
              <h3>Timekeeper Breakdown</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {summary.timekeeper_breakdown.map((timekeeper, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '20px',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 10px 0' }}>{timekeeper.timekeeper_name}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '0.9em', color: '#666' }}>
                          <div>
                            <strong>Billable Hours:</strong> {timekeeper.billable_hours.toFixed(2)}
                          </div>
                          <div>
                            <strong>Rate Used:</strong> ${timekeeper.rate_used.toFixed(2)}/hr
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#28a745' }}>
                          ${timekeeper.billable_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        selectedMatter && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6c757d', 
            fontStyle: 'italic' 
          }}>
            No time entries found for this matter.
          </div>
        )
      )}

      {!selectedMatter && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#6c757d', 
          fontStyle: 'italic' 
        }}>
          Please select a matter to view its billing summary.
        </div>
      )}
    </div>
  );
};

export default BillingSummary;