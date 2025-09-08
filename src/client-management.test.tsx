import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ClientManagement from './components/ClientManagement';
import { database } from './database';

// Mock the database
jest.mock('./database', () => ({
  database: {
    getClients: jest.fn(),
    createClient: jest.fn(),
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
    searchClients: jest.fn(),
    getClientsSorted: jest.fn(),
    getMattersForClient: jest.fn()
  }
}));

const mockDatabase = database as jest.Mocked<typeof database>;

describe('ClientManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getClients.mockResolvedValue([]);
    mockDatabase.searchClients.mockResolvedValue([]);
    mockDatabase.getClientsSorted.mockResolvedValue([]);
  });

  describe('Component Rendering', () => {
    test('should render Client Management title', async () => {
      render(<ClientManagement />);
      
      expect(screen.getByText('Client Management')).toBeInTheDocument();
    });

    test('should render New Client button', async () => {
      render(<ClientManagement />);
      
      expect(screen.getByText('+ New Client')).toBeInTheDocument();
    });

    test('should render search input', async () => {
      render(<ClientManagement />);
      
      expect(screen.getByPlaceholderText('Search by client name...')).toBeInTheDocument();
    });

    test('should render sort dropdown', async () => {
      render(<ClientManagement />);
      
      expect(screen.getByText('Sort:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('By Name')).toBeInTheDocument();
    });

    test('should display existing clients in card format', async () => {
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Test Client Corp',
          description: 'A test client',
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
      mockDatabase.getClientsSorted.mockResolvedValue(mockClients);

      render(<ClientManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Client Corp')).toBeInTheDocument();
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
        expect(screen.getByText('Created: 8/15/2025')).toBeInTheDocument();
        expect(screen.getByText('Created: 8/10/2025')).toBeInTheDocument();
      });
    });
  });

  describe('New Client Form', () => {
    test('should show form when New Client button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientManagement />);

      const newClientButton = screen.getByText('+ New Client');
      await user.click(newClientButton);

      expect(screen.getByText('Client Name:')).toBeInTheDocument();
      expect(screen.getByText('Description:')).toBeInTheDocument();
      expect(screen.getByText('Address:')).toBeInTheDocument();
      expect(screen.getByText('Contact Name:')).toBeInTheDocument();
      expect(screen.getByText('Contact Phone:')).toBeInTheDocument();
      expect(screen.getByText('Contact Email:')).toBeInTheDocument();
      expect(screen.getByText('Create Client')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('should have correct form field placeholders', async () => {
      const user = userEvent.setup();
      render(<ClientManagement />);

      await user.click(screen.getByText('+ New Client'));

      expect(screen.getByPlaceholderText('Enter client name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter client description')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter client address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter contact name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter contact phone')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter contact email')).toBeInTheDocument();
    });

    test('should require client name field', async () => {
      const user = userEvent.setup();
      render(<ClientManagement />);

      await user.click(screen.getByText('+ New Client'));
      await user.click(screen.getByText('Create Client'));

      // Form should not submit without required field
      expect(mockDatabase.createClient).not.toHaveBeenCalled();
    });

    test('should successfully create client with only name field', async () => {
      const user = userEvent.setup();
      const mockClient = {
        id: 1,
        client_number: '000000',
        name: 'Minimal Client',
        description: '',
        address: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        created_at: '2025-09-08T16:00:00.000Z'
      };

      mockDatabase.createClient.mockResolvedValue(mockClient);
      mockDatabase.getClients.mockResolvedValue([mockClient]);
      mockDatabase.getClientsSorted.mockResolvedValue([mockClient]);

      render(<ClientManagement />);

      // Open form and enter only name
      await user.click(screen.getByText('+ New Client'));
      await user.type(screen.getByPlaceholderText('Enter client name'), 'Minimal Client');
      await user.click(screen.getByText('Create Client'));

      expect(mockDatabase.createClient).toHaveBeenCalledWith({
        name: 'Minimal Client',
        description: '',
        address: '',
        contact_name: '',
        contact_phone: '',
        contact_email: ''
      });
    });

    test('should successfully create client with valid data', async () => {
      const user = userEvent.setup();
      const mockClient = {
        id: 1,
        client_number: '000000',
        name: 'New Test Client',
        description: 'Test description',
        address: '123 Test Address',
        contact_name: 'Test Contact',
        contact_phone: '555-TEST',
        contact_email: 'test@client.com',
        created_at: '2025-09-08T16:00:00.000Z'
      };

      mockDatabase.createClient.mockResolvedValue(mockClient);
      mockDatabase.getClients.mockResolvedValue([mockClient]);
      mockDatabase.getClientsSorted.mockResolvedValue([mockClient]);

      render(<ClientManagement />);

      // Open form
      await user.click(screen.getByText('+ New Client'));

      // Fill out form
      await user.type(screen.getByPlaceholderText('Enter client name'), 'New Test Client');
      await user.type(screen.getByPlaceholderText('Enter client description'), 'Test description');
      await user.type(screen.getByPlaceholderText('Enter client address'), '123 Test Address');
      await user.type(screen.getByPlaceholderText('Enter contact name'), 'Test Contact');
      await user.type(screen.getByPlaceholderText('Enter contact phone'), '555-TEST');
      await user.type(screen.getByPlaceholderText('Enter contact email'), 'test@client.com');

      // Submit form
      await user.click(screen.getByText('Create Client'));

      expect(mockDatabase.createClient).toHaveBeenCalledWith({
        name: 'New Test Client',
        description: 'Test description',
        address: '123 Test Address',
        contact_name: 'Test Contact',
        contact_phone: '555-TEST',
        contact_email: 'test@client.com'
      });
    });

    test('should close form when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientManagement />);

      await user.click(screen.getByText('+ New Client'));
      expect(screen.getByText('Client Name:')).toBeInTheDocument();

      await user.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Client Name:')).not.toBeInTheDocument();
    });

    test('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      const mockClient = {
        id: 1,
        client_number: '000000',
        name: 'Test Client',
        description: 'Test desc',
        address: '123 Test St',
        contact_name: 'Test',
        contact_phone: '555-TEST',
        contact_email: 'test@test.com',
        created_at: '2025-09-08T16:00:00.000Z'
      };

      mockDatabase.createClient.mockResolvedValue(mockClient);
      mockDatabase.getClients.mockResolvedValue([mockClient]);
      mockDatabase.getClientsSorted.mockResolvedValue([mockClient]);

      render(<ClientManagement />);

      await user.click(screen.getByText('+ New Client'));
      await user.type(screen.getByPlaceholderText('Enter client name'), 'Test Client');
      await user.click(screen.getByText('Create Client'));

      await waitFor(() => {
        expect(screen.queryByText('Client Name:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    test('should call searchClients when search input changes', async () => {
      const user = userEvent.setup();
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Apple Corp',
          description: 'Tech company',
          address: '123 Tech St',
          contact_name: 'Tim Apple',
          contact_phone: '555-APPLE',
          contact_email: 'tim@apple.com',
          created_at: '2025-08-15T10:00:00.000Z'
        }
      ];

      mockDatabase.searchClients.mockResolvedValue(mockClients);
      render(<ClientManagement />);

      const searchInput = screen.getByPlaceholderText('Search by client name...');
      await user.type(searchInput, 'Apple');

      await waitFor(() => {
        expect(mockDatabase.searchClients).toHaveBeenCalledWith('Apple');
      });
    });

    test('should call getClientsSorted when sort option changes', async () => {
      const user = userEvent.setup();
      render(<ClientManagement />);

      const sortSelect = screen.getByDisplayValue('By Name');
      await user.selectOptions(sortSelect, 'By Date Created');

      expect(mockDatabase.getClientsSorted).toHaveBeenCalledWith('created');
    });
  });

  describe('Client Actions', () => {
    test('should show context menu with edit and delete options', async () => {
      const user = userEvent.setup();
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Test Client',
          description: 'Test description',
          address: '123 Test St',
          contact_name: 'Test Contact',
          contact_phone: '555-TEST',
          contact_email: 'test@client.com',
          created_at: '2025-08-15T10:00:00.000Z'
        }
      ];

      mockDatabase.getClients.mockResolvedValue(mockClients);
      mockDatabase.getClientsSorted.mockResolvedValue(mockClients);

      render(<ClientManagement />);

      await waitFor(() => {
        expect(screen.getByText('Test Client')).toBeInTheDocument();
      });

      // Click on the context menu button (three dots)
      const contextMenuButton = screen.getByRole('button', { name: /more options/i });
      await user.click(contextMenuButton);

      expect(screen.getByText('Edit Client')).toBeInTheDocument();
      expect(screen.getByText('Delete Client')).toBeInTheDocument();
    });

    test('should show confirmation dialog when deleting client', async () => {
      const user = userEvent.setup();
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Client to Delete',
          description: 'This will be deleted',
          address: '123 Delete St',
          contact_name: 'Delete Me',
          contact_phone: '555-DELETE',
          contact_email: 'delete@client.com',
          created_at: '2025-08-15T10:00:00.000Z'
        }
      ];

      mockDatabase.getClients.mockResolvedValue(mockClients);
      mockDatabase.getClientsSorted.mockResolvedValue(mockClients);
      mockDatabase.getMattersForClient.mockResolvedValue([
        { id: 1, client_id: 1, client_name: 'Client to Delete', matter_name: 'Test Matter', matter_number: '0000', description: 'Test matter', status: 'active' as const, created_at: '2025-09-08T16:00:00.000Z' }
      ]);

      render(<ClientManagement />);

      await waitFor(() => {
        expect(screen.getByText('Client to Delete')).toBeInTheDocument();
      });

      const contextMenuButton = screen.getByRole('button', { name: /more options/i });
      await user.click(contextMenuButton);
      await user.click(screen.getByText('Delete Client'));

      expect(screen.getByText(/This will permanently delete/)).toBeInTheDocument();
      expect(screen.getByText(/This will also delete 1 associated matter/)).toBeInTheDocument();
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('should call deleteClient when deletion is confirmed', async () => {
      const user = userEvent.setup();
      const mockClients = [
        {
          id: 1,
          client_number: '000000',
          name: 'Client to Delete',
          description: 'This will be deleted',
          address: '123 Delete St',
          contact_name: 'Delete Me',
          contact_phone: '555-DELETE',
          contact_email: 'delete@client.com',
          created_at: '2025-08-15T10:00:00.000Z'
        }
      ];

      mockDatabase.getClients.mockResolvedValue(mockClients);
      mockDatabase.getClientsSorted.mockResolvedValue(mockClients);
      mockDatabase.getMattersForClient.mockResolvedValue([]);
      mockDatabase.deleteClient.mockResolvedValue(undefined);

      render(<ClientManagement />);

      await waitFor(() => {
        expect(screen.getByText('Client to Delete')).toBeInTheDocument();
      });

      const contextMenuButton = screen.getByRole('button', { name: /more options/i });
      await user.click(contextMenuButton);
      await user.click(screen.getByText('Delete Client'));
      await user.click(screen.getByText('Confirm Delete'));

      expect(mockDatabase.deleteClient).toHaveBeenCalledWith(1);
    });
  });
});