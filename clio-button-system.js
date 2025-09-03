// Clio-Inspired Button Design System
// Based on professional legal software UI patterns

export const ClioButtonStyles = {
  // Primary action buttons - for main actions like Save, Submit, Create
  primary: {
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
    letterSpacing: '-0.2px',
    // Hover effects applied via onMouseEnter/onMouseLeave
    hoverStyle: {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)',
      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
    }
  },

  // Secondary action buttons - for supportive actions like Edit, New
  secondary: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.1px',
    hoverStyle: {
      transform: 'translateY(-1px)',
      borderColor: '#cbd5e1',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }
  },

  // Success/Positive action buttons - for confirmations, successful actions
  success: {
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
    letterSpacing: '-0.2px',
    hoverStyle: {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)',
      background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
    }
  },

  // Danger/Delete buttons - for destructive actions
  danger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px',
    hoverStyle: {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)',
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    }
  },

  // Small/compact buttons - for inline actions
  small: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
    transition: 'all 0.15s ease',
    hoverStyle: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
    }
  },

  // Utility/neutral buttons - for Cancel, Close, neutral actions
  utility: {
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.1px',
    hoverStyle: {
      transform: 'translateY(-1px)',
      borderColor: '#94a3b8',
      color: '#475569',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
    }
  }
};

// Helper function to apply hover effects
export const applyHoverEffects = (element, style) => {
  const originalStyle = { ...style };
  const hoverStyle = style.hoverStyle;

  element.onmouseenter = () => {
    Object.assign(element.style, hoverStyle);
  };

  element.onmouseleave = () => {
    // Reset to original style (excluding hoverStyle)
    const resetStyle = { ...originalStyle };
    delete resetStyle.hoverStyle;
    Object.assign(element.style, resetStyle);
  };
};

// Usage examples:
/*
// Primary button
<button
  style={ClioButtonStyles.primary}
  onMouseEnter={(e) => Object.assign(e.target.style, ClioButtonStyles.primary.hoverStyle)}
  onMouseLeave={(e) => {
    const resetStyle = { ...ClioButtonStyles.primary };
    delete resetStyle.hoverStyle;
    Object.assign(e.target.style, resetStyle);
  }}
>
  Save Changes
</button>

// Secondary button
<button style={ClioButtonStyles.secondary}>
  Cancel
</button>

// Success button
<button style={ClioButtonStyles.success}>
  Create Matter
</button>

// Danger button
<button style={ClioButtonStyles.danger}>
  Delete
</button>
*/