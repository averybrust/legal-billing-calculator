import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';
import Navigation from './components/Navigation';
import MatterManagement from './components/MatterManagement';
import { database } from './database';

// Mock the database
jest.mock('./database', () => ({
  database: {
    getClients: jest.fn(),
    createClient: jest.fn(),
    getMatters: jest.fn(),
    createMatter: jest.fn(),
    getUniqueClients: jest.fn(),
    getTimekeepers: jest.fn(),
    createTimekeeper: jest.fn(),
    getBillingSummary: jest.fn(),
    getTimeEntries: jest.fn()
  }
}));

const mockDatabase = database as jest.Mocked<typeof database>;

describe('Client Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getClients.mockResolvedValue([]);
    mockDatabase.getMatters.mockResolvedValue([]);
    mockDatabase.getUniqueClients.mockResolvedValue([]);
    mockDatabase.getTimekeepers.mockResolvedValue([]);
    mockDatabase.getTimeEntries.mockResolvedValue([]);
  });

  describe('Navigation Integration', () => {
    test('Navigation should include Clients tab between Matters and Team', () => {
      const mockOnViewChange = jest.fn();
      render(<Navigation currentView="matters" onViewChange={mockOnViewChange} />);

      // Check that all tabs are present in correct order
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
      expect(tabs[0]).toHaveTextContent('Matters');
      expect(tabs[1]).toHaveTextContent('Clients');
      expect(tabs[2]).toHaveTextContent('Team');
      expect(tabs[3]).toHaveTextContent('Time Entry');
      expect(tabs[4]).toHaveTextContent('Billing');
    });

    test('clicking Clients tab should call onViewChange with clients', async () => {
      const user = userEvent.setup();
      const mockOnViewChange = jest.fn();
      render(<Navigation currentView="matters" onViewChange={mockOnViewChange} />);

      const clientsTab = screen.getByRole('tab', { name: /clients/i });
      await user.click(clientsTab);

      expect(mockOnViewChange).toHaveBeenCalledWith('clients');
    });

    test('App should render ClientManagement when currentView is clients', () => {
      render(<App />);
      
      // Mock App's internal state by clicking the Clients tab
      const clientsTab = screen.getByRole('tab', { name: /clients/i });
      fireEvent.click(clientsTab);

      expect(screen.getByText('Client Management')).toBeInTheDocument();
    });
  });

  describe('Matter-Client Relationship Constraints', () => {
    test('MatterManagement should show client dropdown instead of text input', async () => {
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Test Client Corp',
          description: 'Test client',
          address: '123 Test St',
          contact_name: 'John Doe',
          contact_phone: '555-1234',
          contact_email: 'john@test.com',
          created_at: '2025-08-15T10:00:00.000Z'
        },
        {
          id: 2,
          client_number: '000001',
          name: 'Acme Corporation',
          description: 'Manufacturing company',
          address: '456 Industry Ave',
          contact_name: 'Jane Smith',
          contact_phone: '555-5678',
          contact_email: 'jane@acme.com',
          created_at: '2025-08-10T14:30:00.000Z'
        }
      ];

      mockDatabase.getClients.mockResolvedValue(mockClients);
      mockDatabase.getMatters.mockResolvedValue([]);

      const user = userEvent.setup();
      render(<MatterManagement />);

      // Click New Matter button
      await waitFor(() => {
        expect(screen.getByText('+ New Matter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('+ New Matter'));

      // Should show client dropdown, not text input
      expect(screen.getByText('Client:')).toBeInTheDocument();
      
      // Should be a select dropdown with clients
      const clientSelect = screen.getByRole('combobox', { name: /client/i });
      expect(clientSelect).toBeInTheDocument();

      // Should not have the old client name text input
      expect(screen.queryByPlaceholderText(/enter client name/i)).not.toBeInTheDocument();
    });

    test('client dropdown should show existing clients', async () => {
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Alpha Corp',
          description: 'First client',
          address: '123 Alpha St',
          contact_name: 'Alpha Contact',
          contact_phone: '555-ALPHA',
          contact_email: 'alpha@corp.com',
          created_at: '2025-08-15T10:00:00.000Z'
        },
        {
          id: 2,
          client_number: '000001',
          name: 'Beta Industries',
          description: 'Second client', 
          address: '456 Beta Ave',
          contact_name: 'Beta Contact',
          contact_phone: '555-BETA',
          contact_email: 'beta@industries.com',
          created_at: '2025-08-10T14:30:00.000Z'
        }
      ];

      mockDatabase.getClients.mockResolvedValue(mockClients);
      mockDatabase.getMatters.mockResolvedValue([]);

      const user = userEvent.setup();
      render(<MatterManagement />);

      await user.click(screen.getByText('+ New Matter'));

      const clientSelect = screen.getByRole('combobox', { name: /client/i });
      await user.click(clientSelect);

      // Should show both clients as options
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
      expect(screen.getByText('Beta Industries')).toBeInTheDocument();
    });

    test('client dropdown should be searchable', async () => {
      const mockClients = [
        {
          id: 1,
          client_number: '000000', 
          name: 'Alpha Corporation',
          description: 'First client',
          address: '123 Alpha St',
          contact_name: 'Alpha Contact',
          contact_phone: '555-ALPHA',
          contact_email: 'alpha@corp.com',
          created_at: '2025-08-15T10:00:00.000Z'
        },
        {
          id: 2,
          client_number: '000001',
          name: 'Beta Industries',
          description: 'Second client',
          address: '456 Beta Ave',
          contact_name: 'Beta Contact',
          contact_phone: '555-BETA',
          contact_email: 'beta@industries.com',
          created_at: '2025-08-10T14:30:00.000Z'
        }
      ];

      mockDatabase.getClients.mockResolvedValue(mockClients);
      mockDatabase.getMatters.mockResolvedValue([]);

      const user = userEvent.setup();
      render(<MatterManagement />);

      await user.click(screen.getByText('+ New Matter'));

      const clientSelect = screen.getByRole('combobox', { name: /client/i });
      await user.type(clientSelect, 'Alpha');

      // Should filter to show only Alpha Corporation
      expect(screen.getByText('Alpha Corporation')).toBeInTheDocument();
      expect(screen.queryByText('Beta Industries')).not.toBeInTheDocument();
    });

    test('matter creation should fail if no client is selected', async () => {
      const user = userEvent.setup();
      mockDatabase.getClients.mockResolvedValue([]);
      mockDatabase.getMatters.mockResolvedValue([]);

      render(<MatterManagement />);

      await user.click(screen.getByText('+ New Matter'));

      // Try to submit without selecting client
      await user.type(screen.getByPlaceholderText(/enter matter name/i), 'Test Matter');
      await user.type(screen.getByPlaceholderText(/enter.*description/i), 'Test description');
      await user.click(screen.getByText('Create Matter'));

      // Should show validation error
      expect(screen.getByText(/please select a client/i)).toBeInTheDocument();
      expect(mockDatabase.createMatter).not.toHaveBeenCalled();
    });

    test('matter creation should succeed with valid client selection', async () => {
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Test Client',
          description: 'Test client',
          address: '123 Test St',
          contact_name: 'Test Contact',
          contact_phone: '555-TEST',
          contact_email: 'test@client.com',
          created_at: '2025-08-15T10:00:00.000Z'
        }
      ];

      const mockMatter = {
        id: 1,
        client_id: 1,
        client_name: 'Test Client',
        matter_number: '0000',
        matter_name: 'Test Matter',
        description: 'Test matter description',
        status: 'active' as const,
        created_at: '2025-09-08T16:00:00.000Z'
      };

      mockDatabase.getClients.mockResolvedValue(mockClients);
      mockDatabase.getMatters.mockResolvedValue([]);
      mockDatabase.createMatter.mockResolvedValue(mockMatter);

      const user = userEvent.setup();
      render(<MatterManagement />);

      await user.click(screen.getByText('+ New Matter'));

      // Select client from dropdown
      const clientSelect = screen.getByRole('combobox', { name: /client/i });
      await user.click(clientSelect);
      await user.click(screen.getByText('Test Client'));

      // Fill other fields
      await user.type(screen.getByPlaceholderText(/enter matter name/i), 'Test Matter');
      await user.type(screen.getByPlaceholderText(/enter.*description/i), 'Test matter description');
      
      await user.click(screen.getByText('Create Matter'));

      expect(mockDatabase.createMatter).toHaveBeenCalledWith({
        client_id: 1,
        matter_name: 'Test Matter',
        description: 'Test matter description',
        status: 'active'
      });
    });
  });

  describe('Full Integration Workflow', () => {
    test('should be able to create client then create matter for that client', async () => {
      const user = userEvent.setup();

      // Mock empty initial state
      mockDatabase.getClients.mockResolvedValue([]);
      mockDatabase.getMatters.mockResolvedValue([]);

      // Mock created client
      const mockClient = {
        id: 1,
        client_number: '000000',
        name: 'Workflow Test Client',
        description: 'Client for testing workflow',
        address: '123 Workflow St',
        contact_name: 'Workflow Contact',
        contact_phone: '555-FLOW',
        contact_email: 'workflow@test.com',
        created_at: '2025-09-08T16:00:00.000Z'
      };

      const mockMatter = {
        id: 1,
        client_id: 1,
        client_name: 'Workflow Test Client',
        matter_number: '0000',
        matter_name: 'Workflow Test Matter',
        description: 'Matter for testing workflow',
        status: 'active' as const,
        created_at: '2025-09-08T16:00:00.000Z'
      };

      render(<App />);

      // Step 1: Go to Clients tab and create a client
      await user.click(screen.getByRole('tab', { name: /clients/i }));
      
      expect(screen.getByText('Client Management')).toBeInTheDocument();
      
      await user.click(screen.getByText('+ New Client'));
      await user.type(screen.getByPlaceholderText('Enter client name'), 'Workflow Test Client');
      await user.type(screen.getByPlaceholderText('Enter client description'), 'Client for testing workflow');
      await user.type(screen.getByPlaceholderText('Enter client address'), '123 Workflow St');
      await user.type(screen.getByPlaceholderText('Enter contact name'), 'Workflow Contact');
      await user.type(screen.getByPlaceholderText('Enter contact phone'), '555-FLOW');
      await user.type(screen.getByPlaceholderText('Enter contact email'), 'workflow@test.com');

      mockDatabase.createClient.mockResolvedValue(mockClient);
      mockDatabase.getClients.mockResolvedValue([mockClient]);
      await user.click(screen.getByText('Create Client'));

      // Step 2: Go to Matters tab and create a matter for the client
      await user.click(screen.getByRole('tab', { name: /matters/i }));
      
      expect(screen.getByText('Matter Management')).toBeInTheDocument();

      await user.click(screen.getByText('+ New Matter'));

      // Client should now be available in dropdown
      const clientSelect = screen.getByRole('combobox', { name: /client/i });
      await user.click(clientSelect);
      await user.click(screen.getByText('Workflow Test Client'));

      await user.type(screen.getByPlaceholderText(/enter matter name/i), 'Workflow Test Matter');
      await user.type(screen.getByPlaceholderText(/enter.*description/i), 'Matter for testing workflow');

      mockDatabase.createMatter.mockResolvedValue(mockMatter);
      await user.click(screen.getByText('Create Matter'));

      expect(mockDatabase.createMatter).toHaveBeenCalledWith({
        client_id: 1,
        matter_name: 'Workflow Test Matter',
        description: 'Matter for testing workflow',
        status: 'active'
      });
    });

    test('deleting client should warn about associated matters', async () => {
      const user = userEvent.setup();

      const mockClient = {
        id: 1,
        client_number: '000000',
        name: 'Client with Matters',
        description: 'This client has matters',
        address: '123 Client St',
        contact_name: 'Client Contact',
        contact_phone: '555-CLIENT',
        contact_email: 'client@test.com',
        created_at: '2025-08-15T10:00:00.000Z'
      };

      const mockMatters = [
        {
          id: 1,
          client_id: 1,
          client_name: 'Client with Matters',
          matter_number: '0000',
          matter_name: 'Matter 1',
          description: 'First matter',
          status: 'active' as const,
          created_at: '2025-09-08T16:00:00.000Z'
        },
        {
          id: 2,
          client_id: 1,
          client_name: 'Client with Matters',
          matter_number: '0001',
          matter_name: 'Matter 2', 
          description: 'Second matter',
          status: 'active' as const,
          created_at: '2025-09-08T16:00:00.000Z'
        }
      ];

      mockDatabase.getClients.mockResolvedValue([mockClient]);
      mockDatabase.getMattersForClient.mockResolvedValue(mockMatters);

      render(<App />);

      // Go to clients tab
      await user.click(screen.getByRole('tab', { name: /clients/i }));

      await waitFor(() => {
        expect(screen.getByText('Client with Matters')).toBeInTheDocument();
      });

      // Try to delete client
      const contextMenuButton = screen.getByRole('button', { name: /more options/i });
      await user.click(contextMenuButton);
      await user.click(screen.getByText('Delete Client'));

      // Should show warning with count
      expect(screen.getByText(/This will also delete 2 associated matters/)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });
  });
});