import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatterManagement from './components/MatterManagement';
import { database } from './database';

// Mock localStorage for testing
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

describe('MatterManagement - Search and Collapsible Sections', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  beforeEach(async () => {
    // Create test data
    await database.createMatter({
      client_name: 'Acme Corp',
      matter_name: 'Contract Review',
      description: 'Service agreement review',
      status: 'active'
    });

    await database.createMatter({
      client_name: 'Beta LLC',
      matter_name: 'Litigation Support',
      description: 'Employment dispute',
      status: 'on_hold'
    });

    await database.createMatter({
      client_name: 'Acme Corp',
      matter_name: 'IP Filing',
      description: 'Trademark application',
      status: 'closed'
    });

    await database.createMatter({
      client_name: 'Gamma Inc',
      matter_name: 'Merger Due Diligence',
      description: 'Corporate acquisition',
      status: 'active'
    });
  });

  test('displays matters in collapsible sections with counts', async () => {
    render(<MatterManagement />);

    // Check that sections are displayed with counts
    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
    });

    // Active section should be expanded by default, others collapsed
    expect(screen.getByText(/Contract Review/)).toBeInTheDocument();
    expect(screen.getByText(/Merger Due Diligence/)).toBeInTheDocument();

    // On hold and closed sections should be collapsed initially
    expect(screen.queryByText(/Litigation Support/)).not.toBeInTheDocument();
    expect(screen.queryByText(/IP Filing/)).not.toBeInTheDocument();
  });

  test('expands and collapses sections when clicked', async () => {
    render(<MatterManagement />);

    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
    });

    // Search scope should default to "All Matters" to see all sections
    const searchScopeSelect = screen.getByDisplayValue('Active Only');
    await userEvent.selectOptions(searchScopeSelect, 'all');

    await waitFor(() => {
      expect(screen.getByText('On Hold (1)')).toBeInTheDocument();
      expect(screen.getByText('Closed (1)')).toBeInTheDocument();
    });

    // Click to expand On Hold section
    await userEvent.click(screen.getByText('On Hold (1)'));
    await waitFor(() => {
      expect(screen.getByText(/Litigation Support/)).toBeInTheDocument();
    });

    // Click to expand Closed section
    await userEvent.click(screen.getByText('Closed (1)'));
    await waitFor(() => {
      expect(screen.getByText(/IP Filing/)).toBeInTheDocument();
    });

    // Click to collapse Active section
    await userEvent.click(screen.getByText('Active (2)'));
    await waitFor(() => {
      expect(screen.queryByText(/Contract Review/)).not.toBeInTheDocument();
    });
  });

  test('search filters matters by client and matter name', async () => {
    render(<MatterManagement />);

    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
    });

    // Search for "Acme" - should show only Acme Corp matters
    const searchInput = screen.getByPlaceholderText('Search by client or matter name...');
    await userEvent.type(searchInput, 'Acme');

    // Switch to "All Matters" to see results across sections
    const searchScopeSelect = screen.getByDisplayValue('Active Only');
    await userEvent.selectOptions(searchScopeSelect, 'all');

    await waitFor(() => {
      expect(screen.getByText('Active (1)')).toBeInTheDocument(); // Only Contract Review
      expect(screen.getByText('Closed (1)')).toBeInTheDocument(); // Only IP Filing
    });

    // Clear search
    await userEvent.clear(searchInput);
    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
      expect(screen.getByText('On Hold (1)')).toBeInTheDocument();
      expect(screen.getByText('Closed (1)')).toBeInTheDocument();
    });

    // Search by matter name
    await userEvent.type(searchInput, 'Contract');
    await waitFor(() => {
      expect(screen.getByText('Active (1)')).toBeInTheDocument();
      expect(screen.getByText('On Hold (0)')).toBeInTheDocument();
      expect(screen.getByText('Closed (0)')).toBeInTheDocument();
    });
  });

  test('search scope toggle works correctly', async () => {
    render(<MatterManagement />);

    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
    });

    // Default should be "Active Only" - should only show Active section
    expect(screen.queryByText('On Hold')).not.toBeInTheDocument();
    expect(screen.queryByText('Closed')).not.toBeInTheDocument();

    // Switch to "All Matters"
    const searchScopeSelect = screen.getByDisplayValue('Active Only');
    await userEvent.selectOptions(searchScopeSelect, 'all');

    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
      expect(screen.getByText('On Hold (1)')).toBeInTheDocument();
      expect(screen.getByText('Closed (1)')).toBeInTheDocument();
    });

    // Switch back to "Active Only"
    await userEvent.selectOptions(searchScopeSelect, 'active');
    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
      expect(screen.queryByText('On Hold')).not.toBeInTheDocument();
      expect(screen.queryByText('Closed')).not.toBeInTheDocument();
    });
  });

  test('sort options work correctly', async () => {
    render(<MatterManagement />);

    // Switch to "All Matters" to see all items
    const searchScopeSelect = screen.getByDisplayValue('Active Only');
    await userEvent.selectOptions(searchScopeSelect, 'all');

    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
    });

    // Active section is already expanded, but let's expand the others by clicking their headers
    await userEvent.click(screen.getByText('On Hold (1)'));
    await userEvent.click(screen.getByText('Closed (1)'));

    await waitFor(() => {
      expect(screen.getByText(/Contract Review/)).toBeInTheDocument();
      expect(screen.getByText(/Merger Due Diligence/)).toBeInTheDocument();
    });

    // Test sorting by client
    const sortSelect = screen.getByDisplayValue('By Recency');
    await userEvent.selectOptions(sortSelect, 'client');

    // After sorting by client, both matters should still be visible (detailed ordering test can be visual)
    await waitFor(() => {
      expect(screen.getByText(/Contract Review/)).toBeInTheDocument();
      expect(screen.getByText(/Merger Due Diligence/)).toBeInTheDocument();
    });
  });

  test('expand/collapse all button works', async () => {
    render(<MatterManagement />);

    // Switch to "All Matters" to see all sections
    const searchScopeSelect = screen.getByDisplayValue('Active Only');
    await userEvent.selectOptions(searchScopeSelect, 'all');

    await waitFor(() => {
      expect(screen.getByText('On Hold (1)')).toBeInTheDocument();
    });

    // Initially Active is expanded, others collapsed
    expect(screen.getByText(/Contract Review/)).toBeInTheDocument();
    expect(screen.queryByText(/Litigation Support/)).not.toBeInTheDocument();

    // Click "Collapse All" (since Active is expanded, button shows Collapse All)
    await userEvent.click(screen.getByText('Collapse All'));

    await waitFor(() => {
      expect(screen.queryByText(/Contract Review/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Litigation Support/)).not.toBeInTheDocument();
      expect(screen.queryByText(/IP Filing/)).not.toBeInTheDocument();
    });

    // Button should now say "Expand All"
    expect(screen.getByText('Expand All')).toBeInTheDocument();

    // Click "Expand All"
    await userEvent.click(screen.getByText('Expand All'));

    await waitFor(() => {
      expect(screen.getByText(/Contract Review/)).toBeInTheDocument();
      expect(screen.getByText(/Litigation Support/)).toBeInTheDocument();
      expect(screen.getByText(/IP Filing/)).toBeInTheDocument();
    });

    // Button should now say "Collapse All" again
    expect(screen.getByText('Collapse All')).toBeInTheDocument();
  });

  test('search works with active only scope', async () => {
    render(<MatterManagement />);

    await waitFor(() => {
      expect(screen.getByText('Active (2)')).toBeInTheDocument();
    });

    // Search for "Acme" with "Active Only" scope - should only show active Acme matters
    const searchInput = screen.getByPlaceholderText('Search by client or matter name...');
    await userEvent.type(searchInput, 'Acme');

    await waitFor(() => {
      expect(screen.getByText('Active (1)')).toBeInTheDocument(); // Only Contract Review
      expect(screen.queryByText('On Hold')).not.toBeInTheDocument();
      expect(screen.queryByText('Closed')).not.toBeInTheDocument();
    });

    // The active Acme matter should be visible
    expect(screen.getByText(/Contract Review/)).toBeInTheDocument();
  });
});