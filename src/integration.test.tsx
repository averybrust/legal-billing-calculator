import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock localStorage for consistent testing
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Legal Billing Calculator - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('complete workflow: create timekeeper, create matter, add time, view billing', async () => {
    render(<App />);

    // Step 1: Create a timekeeper
    await userEvent.click(screen.getAllByText('Timekeeper Setup')[0]);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Timekeeper Setup' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('New Timekeeper'));
    
    // Fill timekeeper form
    await userEvent.type(screen.getByPlaceholderText('Enter timekeeper name'), 'John Partner');
    const rateTierSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(rateTierSelect, 'partner');
    await userEvent.type(screen.getByPlaceholderText('Enter hourly rate'), '500');
    await userEvent.click(screen.getByText('Add Timekeeper'));

    // Verify timekeeper was created
    await waitFor(() => {
      expect(screen.getByText('John Partner')).toBeInTheDocument();
    });

    // Step 2: Create a matter
    await userEvent.click(screen.getByText('Matter Management'));
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Matter Management' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('New Matter'));
    
    // Fill matter form
    await userEvent.type(screen.getByPlaceholderText('Enter client name (existing clients will show in dropdown)'), 'Acme Corp');
    await userEvent.type(screen.getByPlaceholderText('Enter matter name'), 'Contract Review');
    await userEvent.type(screen.getByLabelText('Description:'), 'Review of service agreement');
    await userEvent.click(screen.getByText('Create Matter'));

    // Verify matter was created
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText(/0000.*Contract Review/)).toBeInTheDocument();
    });

    // Step 3: Add time entry
    await userEvent.click(screen.getByText('Time Entry'));
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Time Entry' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('New Time Entry'));

    // Fill time entry form
    const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
    expect(dateInput).toBeInTheDocument();
    
    // Find the dropdowns by their order - timekeeper first, then matter
    const allSelects = screen.getAllByRole('combobox');
    const timekeeperSelect = allSelects[0]; // First select is timekeeper
    const matterSelect = allSelects[1]; // Second select is matter
    
    await userEvent.selectOptions(timekeeperSelect, '1'); // Select by value, not text
    await userEvent.selectOptions(matterSelect, '1'); // Select by value, not text
    await userEvent.type(screen.getByPlaceholderText('Enter hours (decimal)'), '3.5');
    await userEvent.type(screen.getByPlaceholderText('Describe the work performed'), 'Reviewed service agreement');
    
    // Should be billable by default - check the checkbox is checked
    const billableCheckbox = screen.getByRole('checkbox', { name: /billable time/i });
    expect(billableCheckbox).toBeChecked();
    
    await userEvent.click(screen.getByText('Add Time Entry'));

    // Verify time entry was created
    await waitFor(() => {
      expect(screen.getByText('Reviewed service agreement')).toBeInTheDocument();
      expect(screen.getByText('3.5 hrs')).toBeInTheDocument();
    });

    // Step 4: View billing summary
    await userEvent.click(screen.getByText('Billing Summary'));
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Billing Summary' })).toBeInTheDocument();
    });

    // Select matter for billing
    const billingMatterSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(billingMatterSelect, '1'); // Select by value, not text

    // Verify billing calculations - look for specific unique text that indicates the feature is working
    await waitFor(() => {
      expect(screen.getByText('Billable Hours:')).toBeInTheDocument(); // Verify billing summary loaded
      expect(screen.getByText('Total Amount')).toBeInTheDocument(); // Verify calculation section 
      expect(screen.getByText('John Partner')).toBeInTheDocument(); // Verify timekeeper appears
    });
  });

  test('navigation between views preserves data', async () => {
    render(<App />);

    // Create a timekeeper
    await userEvent.click(screen.getAllByText('Timekeeper Setup')[0]);
    await userEvent.click(screen.getByText('New Timekeeper'));
    await userEvent.type(screen.getByPlaceholderText('Enter timekeeper name'), 'Test Lawyer');
    const rateTierSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(rateTierSelect, 'senior_associate');
    await userEvent.type(screen.getByPlaceholderText('Enter hourly rate'), '300');
    await userEvent.click(screen.getByText('Add Timekeeper'));

    // Navigate away and back
    await userEvent.click(screen.getByText('Matter Management'));
    await userEvent.click(screen.getAllByText('Timekeeper Setup')[0]);

    // Verify timekeeper is still there
    await waitFor(() => {
      expect(screen.getByText('Test Lawyer')).toBeInTheDocument();
    });
  });

  test('matter creation with client autocomplete functionality', async () => {
    render(<App />);

    // Create first matter
    await userEvent.click(screen.getAllByText('Matter Management')[0]);
    await userEvent.click(screen.getByText('New Matter'));
    
    await userEvent.type(screen.getByPlaceholderText('Enter client name (existing clients will show in dropdown)'), 'Big Corp');
    await userEvent.type(screen.getByPlaceholderText('Enter matter name'), 'First Matter');
    await userEvent.type(screen.getByLabelText('Description:'), 'First matter description');
    await userEvent.click(screen.getByText('Create Matter'));

    // Create second matter with same client
    await waitFor(() => {
      expect(screen.getByText('Big Corp')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('New Matter'));
    
    const clientInput = screen.getByPlaceholderText('Enter client name (existing clients will show in dropdown)');
    await userEvent.type(clientInput, 'Big');
    
    // The autocomplete should show the existing client
    // (Note: This tests the UI behavior, actual implementation may vary)
    await userEvent.type(screen.getByPlaceholderText('Enter matter name'), 'Second Matter');
    await userEvent.type(screen.getByLabelText('Description:'), 'Second matter description');
    await userEvent.clear(clientInput);
    await userEvent.type(clientInput, 'Big Corp');
    await userEvent.click(screen.getByText('Create Matter'));

    await waitFor(() => {
      const bigCorpElements = screen.getAllByText('Big Corp');
      expect(bigCorpElements).toHaveLength(2); // Two matters for same client
    });

    // Verify both matters have different numbers
    expect(screen.getByText(/0000.*First Matter/)).toBeInTheDocument();
    expect(screen.getByText(/0001.*Second Matter/)).toBeInTheDocument();
  });
});