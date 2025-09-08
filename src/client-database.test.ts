import { database } from './database';

// Define Client interface for testing (this should match what's implemented in database.ts)
interface Client {
  id: number;
  client_number: string;
  name: string;
  description?: string;
  address?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
}

// Mock localStorage for testing
const mockLocalStorage = () => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage() });

describe('Client Database Operations', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Client Data Model', () => {
    test('Client interface should have correct structure', async () => {
      const clientData = {
        name: 'Test Client Corp',
        description: 'A test client corporation',
        address: '123 Main St, City, State 12345',
        contact_name: 'John Doe',
        contact_phone: '555-123-4567',
        contact_email: 'john@testclient.com'
      };

      const client = await database.createClient(clientData);
      
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('client_number');
      expect(client).toHaveProperty('name', clientData.name);
      expect(client).toHaveProperty('description', clientData.description);
      expect(client).toHaveProperty('address', clientData.address);
      expect(client).toHaveProperty('contact_name', clientData.contact_name);
      expect(client).toHaveProperty('contact_phone', clientData.contact_phone);
      expect(client).toHaveProperty('contact_email', clientData.contact_email);
      expect(client).toHaveProperty('created_at');
      expect(typeof client.created_at).toBe('string');
    });

    test('Client numbers should auto-increment starting from 000000', async () => {
      const client1 = await database.createClient({
        name: 'First Client',
        description: 'First test client',
        address: '123 First St',
        contact_name: 'First Contact',
        contact_phone: '555-0001',
        contact_email: 'first@client.com'
      });

      const client2 = await database.createClient({
        name: 'Second Client', 
        description: 'Second test client',
        address: '456 Second Ave',
        contact_name: 'Second Contact',
        contact_phone: '555-0002',
        contact_email: 'second@client.com'
      });

      expect(client1.client_number).toBe('000000');
      expect(client2.client_number).toBe('000001');
    });

    test('Client IDs should be unique integers', async () => {
      const client1 = await database.createClient({
        name: 'Client One',
        description: 'Test client',
        address: '123 Test St',
        contact_name: 'Test Contact',
        contact_phone: '555-1234',
        contact_email: 'test@client.com'
      });

      const client2 = await database.createClient({
        name: 'Client Two',
        description: 'Another test client', 
        address: '456 Test Ave',
        contact_name: 'Another Contact',
        contact_phone: '555-5678',
        contact_email: 'another@client.com'
      });

      expect(typeof client1.id).toBe('number');
      expect(typeof client2.id).toBe('number');
      expect(client1.id).not.toBe(client2.id);
    });
  });

  describe('Client CRUD Operations', () => {
    test('createClient should successfully create a new client with all fields', async () => {
      const clientData = {
        name: 'Acme Corporation',
        description: 'Large manufacturing company',
        address: '789 Industrial Blvd, Manufacturing City, MC 54321',
        contact_name: 'Jane Smith',
        contact_phone: '555-987-6543',
        contact_email: 'jane.smith@acme.com'
      };

      const client = await database.createClient(clientData);
      
      expect(client.name).toBe(clientData.name);
      expect(client.description).toBe(clientData.description);
      expect(client.address).toBe(clientData.address);
      expect(client.contact_name).toBe(clientData.contact_name);
      expect(client.contact_phone).toBe(clientData.contact_phone);
      expect(client.contact_email).toBe(clientData.contact_email);
    });

    test('createClient should work with only required name field', async () => {
      const clientData = {
        name: 'Minimal Client'
      };

      const client = await database.createClient(clientData);
      
      expect(client.name).toBe('Minimal Client');
      expect(client.description).toBe('');
      expect(client.address).toBe('');
      expect(client.contact_name).toBe('');
      expect(client.contact_phone).toBe('');
      expect(client.contact_email).toBe('');
    });

    test('getClients should return all clients', async () => {
      await database.createClient({
        name: 'Client Alpha',
        description: 'First client',
        address: '123 Alpha St',
        contact_name: 'Alpha Contact',
        contact_phone: '555-1111',
        contact_email: 'alpha@client.com'
      });

      await database.createClient({
        name: 'Client Beta',
        description: 'Second client',
        address: '456 Beta Ave', 
        contact_name: 'Beta Contact',
        contact_phone: '555-2222',
        contact_email: 'beta@client.com'
      });

      const clients = await database.getClients();
      
      expect(clients).toHaveLength(2);
      expect(clients[0].name).toBe('Client Alpha');
      expect(clients[1].name).toBe('Client Beta');
    });

    test('getClient should return specific client by ID', async () => {
      const createdClient = await database.createClient({
        name: 'Specific Client',
        description: 'A specific test client',
        address: '999 Specific Rd',
        contact_name: 'Specific Person',
        contact_phone: '555-9999',
        contact_email: 'specific@client.com'
      });

      const retrievedClient = await database.getClient(createdClient.id);
      
      expect(retrievedClient).not.toBeNull();
      expect(retrievedClient?.id).toBe(createdClient.id);
      expect(retrievedClient?.name).toBe('Specific Client');
    });

    test('updateClient should modify existing client', async () => {
      const client = await database.createClient({
        name: 'Original Name',
        description: 'Original description',
        address: '123 Original St',
        contact_name: 'Original Contact',
        contact_phone: '555-0000',
        contact_email: 'original@client.com'
      });

      const updates = {
        name: 'Updated Name',
        contact_phone: '555-1111'
      };

      await database.updateClient(client.id, updates);
      const updatedClient = await database.getClient(client.id);
      
      expect(updatedClient?.name).toBe('Updated Name');
      expect(updatedClient?.contact_phone).toBe('555-1111');
      expect(updatedClient?.description).toBe('Original description'); // unchanged
    });

    test('deleteClient should remove client and cascade to matters', async () => {
      // Create client
      const client = await database.createClient({
        name: 'Client to Delete',
        description: 'This client will be deleted',
        address: '123 Delete St',
        contact_name: 'Delete Contact',
        contact_phone: '555-DELETE',
        contact_email: 'delete@client.com'
      });

      // Create timekeeper for matter
      const timekeeper = await database.createTimekeeper({
        name: 'Test Lawyer',
        rate_tier: 'partner',
        standard_rate: 500
      });

      // Create matter for this client
      const matter = await database.createMatter({
        client_id: client.id,
        matter_name: 'Test Matter for Deletion',
        description: 'This matter should be deleted with client'
      });

      // Verify matter exists
      const mattersBeforeDelete = await database.getMatters();
      expect(mattersBeforeDelete.some(m => m.id === matter.id)).toBe(true);

      // Delete client
      await database.deleteClient(client.id);

      // Verify client is deleted
      const clientAfterDelete = await database.getClient(client.id);
      expect(clientAfterDelete).toBeNull();

      // Verify associated matters are deleted
      const mattersAfterDelete = await database.getMatters();
      expect(mattersAfterDelete.some(m => m.id === matter.id)).toBe(false);
    });
  });

  describe('Client Search and Filtering', () => {
    beforeEach(async () => {
      await database.createClient({
        name: 'Apple Corporation',
        description: 'Technology company',
        address: '123 Tech St',
        contact_name: 'Tim Apple',
        contact_phone: '555-APPLE',
        contact_email: 'tim@apple.com'
      });

      await database.createClient({
        name: 'Beta Industries',
        description: 'Manufacturing company',
        address: '456 Industry Ave',
        contact_name: 'Beta Manager',
        contact_phone: '555-BETA',
        contact_email: 'manager@beta.com'
      });

      await database.createClient({
        name: 'Acme Services',
        description: 'Service provider',
        address: '789 Service Blvd',
        contact_name: 'Acme Contact',
        contact_phone: '555-ACME',
        contact_email: 'contact@acme.com'
      });
    });

    test('searchClients should filter by name', async () => {
      const results = await database.searchClients('Apple');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple Corporation');
    });

    test('searchClients should be case insensitive', async () => {
      const results = await database.searchClients('apple');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple Corporation');
    });

    test('searchClients should return all clients for empty query', async () => {
      const results = await database.searchClients('');
      
      expect(results).toHaveLength(3);
    });

    test('getClientsSorted should sort by name alphabetically', async () => {
      const clients = await database.getClientsSorted('name');
      
      expect(clients[0].name).toBe('Acme Services');
      expect(clients[1].name).toBe('Apple Corporation'); 
      expect(clients[2].name).toBe('Beta Industries');
    });

    test('getClientsSorted should sort by creation date (newest first)', async () => {
      const clients = await database.getClientsSorted('created');
      
      // Should be in reverse chronological order (newest first)
      expect(clients[0].name).toBe('Acme Services');
      expect(clients[1].name).toBe('Beta Industries');
      expect(clients[2].name).toBe('Apple Corporation');
    });
  });

  describe('Client-Matter Relationship Constraints', () => {
    test('createMatter should require existing client_id', async () => {
      const nonExistentClientId = 99999;
      
      await expect(
        database.createMatter({
          client_id: nonExistentClientId,
          matter_name: 'Test Matter',
          description: 'This should fail'
        })
      ).rejects.toThrow('Client not found');
    });

    test('createMatter should succeed with valid client_id', async () => {
      const client = await database.createClient({
        name: 'Valid Client',
        description: 'A valid client for matter creation',
        address: '123 Valid St',
        contact_name: 'Valid Contact',
        contact_phone: '555-VALID',
        contact_email: 'valid@client.com'
      });

      const matter = await database.createMatter({
        client_id: client.id,
        matter_name: 'Valid Matter',
        description: 'This should succeed'
      });

      expect(matter.client_id).toBe(client.id);
    });

    test('getMattersForClient should return only matters for specific client', async () => {
      const client1 = await database.createClient({
        name: 'Client One',
        description: 'First client',
        address: '123 First St',
        contact_name: 'First Contact',
        contact_phone: '555-0001',
        contact_email: 'first@client.com'
      });

      const client2 = await database.createClient({
        name: 'Client Two',
        description: 'Second client',
        address: '456 Second Ave',
        contact_name: 'Second Contact',
        contact_phone: '555-0002',
        contact_email: 'second@client.com'
      });

      await database.createMatter({
        client_id: client1.id,
        matter_name: 'Matter for Client One',
        description: 'First matter'
      });

      await database.createMatter({
        client_id: client2.id,
        matter_name: 'Matter for Client Two',
        description: 'Second matter'
      });

      const client1Matters = await database.getMattersForClient(client1.id);
      const client2Matters = await database.getMattersForClient(client2.id);

      expect(client1Matters).toHaveLength(1);
      expect(client2Matters).toHaveLength(1);
      expect(client1Matters[0].client_id).toBe(client1.id);
      expect(client2Matters[0].client_id).toBe(client2.id);
    });
  });
});