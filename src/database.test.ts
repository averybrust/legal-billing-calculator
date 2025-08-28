import { Database, Matter, Timekeeper, TimeEntry, MatterRate } from './database';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
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

describe('Database', () => {
  let db: Database;

  beforeEach(() => {
    localStorage.clear();
    db = new Database();
  });

  describe('Matter Management', () => {
    test('creates matter with auto-generated matter number', async () => {
      const matterId = await db.createMatter({
        client_name: 'Test Client',
        matter_name: 'Test Matter',
        description: 'Test matter description',
        status: 'active'
      });

      expect(matterId).toBe(1);

      const matter = await db.getMatter(matterId);
      expect(matter).toMatchObject({
        id: 1,
        client_name: 'Test Client',
        matter_number: '0000',
        matter_name: 'Test Matter',
        description: 'Test matter description',
        status: 'active'
      });
      expect(matter.created_at).toBeDefined();
    });

    test('generates sequential matter numbers per client', async () => {
      await db.createMatter({
        client_name: 'Client A',
        matter_name: 'First Matter A',
        description: 'First matter',
        status: 'active'
      });

      await db.createMatter({
        client_name: 'Client A',
        matter_name: 'Second Matter A',
        description: 'Second matter',
        status: 'active'
      });

      await db.createMatter({
        client_name: 'Client B',
        matter_name: 'First Matter B',
        description: 'First matter for B',
        status: 'active'
      });

      const matters = await db.getMatters();
      expect(matters).toHaveLength(3);
      
      // Find specific matters by client and description to avoid sort order dependency
      const clientAFirst = matters.find(m => m.client_name === 'Client A' && m.description === 'First matter');
      const clientASecond = matters.find(m => m.client_name === 'Client A' && m.description === 'Second matter');
      const clientBFirst = matters.find(m => m.client_name === 'Client B' && m.description === 'First matter for B');
      
      expect(clientAFirst!.matter_number).toBe('0000');
      expect(clientASecond!.matter_number).toBe('0001');
      expect(clientBFirst!.matter_number).toBe('0000');
    });

    test('updates matter successfully', async () => {
      const matterId = await db.createMatter({
        client_name: 'Test Client',
        matter_name: 'Original Matter',
        description: 'Original description',
        status: 'active'
      });

      await db.updateMatter(matterId, {
        description: 'Updated description',
        status: 'closed'
      });

      const updatedMatter = await db.getMatter(matterId);
      expect(updatedMatter.description).toBe('Updated description');
      expect(updatedMatter.status).toBe('closed');
      expect(updatedMatter.client_name).toBe('Test Client'); // Should remain unchanged
      expect(updatedMatter.matter_number).toBe('0000'); // Should remain unchanged
    });

    test('throws error when updating non-existent matter', async () => {
      await expect(db.updateMatter(999, { status: 'closed' }))
        .rejects.toThrow('Matter not found');
    });

    test('gets unique clients', async () => {
      await db.createMatter({ client_name: 'Client A', matter_name: 'Matter A1', description: 'Matter 1', status: 'active' });
      await db.createMatter({ client_name: 'Client B', matter_name: 'Matter B1', description: 'Matter 2', status: 'active' });
      await db.createMatter({ client_name: 'Client A', matter_name: 'Matter A2', description: 'Matter 3', status: 'active' });

      const clients = await db.getUniqueClients();
      expect(clients).toEqual(['Client A', 'Client B']);
    });
  });

  describe('Timekeeper Management', () => {
    test('creates timekeeper successfully', async () => {
      const timekeeperId = await db.createTimekeeper({
        name: 'John Doe',
        rate_tier: 'partner',
        standard_rate: 500
      });

      expect(timekeeperId).toBe(1);

      const timekeepers = await db.getTimekeepers();
      expect(timekeepers[0]).toMatchObject({
        id: 1,
        name: 'John Doe',
        rate_tier: 'partner',
        standard_rate: 500
      });
      expect(timekeepers[0].created_at).toBeDefined();
    });

    test('sorts timekeepers by name', async () => {
      await db.createTimekeeper({ name: 'Zebra', rate_tier: 'partner', standard_rate: 500 });
      await db.createTimekeeper({ name: 'Alpha', rate_tier: 'senior_associate', standard_rate: 300 });

      const timekeepers = await db.getTimekeepers();
      expect(timekeepers[0].name).toBe('Alpha');
      expect(timekeepers[1].name).toBe('Zebra');
    });
  });

  describe('Time Entry Management', () => {
    let matterId: number;
    let timekeeperId: number;

    beforeEach(async () => {
      matterId = await db.createMatter({
        client_name: 'Test Client',
        matter_name: 'Test Matter',
        description: 'Test matter',
        status: 'active'
      });

      timekeeperId = await db.createTimekeeper({
        name: 'Test Lawyer',
        rate_tier: 'senior_associate',
        standard_rate: 350
      });
    });

    test('creates time entry successfully', async () => {
      const entryId = await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        date: '2024-01-15',
        hours: 2.5,
        description: 'Legal research',
        is_billable: true
      });

      expect(entryId).toBe(1);

      const entries = await db.getTimeEntries();
      expect(entries[0]).toMatchObject({
        id: 1,
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        date: '2024-01-15',
        hours: 2.5,
        description: 'Legal research',
        is_billable: true,
        timekeeper_name: 'Test Lawyer',
        client_name: 'Test Client',
        matter_number: '0000'
      });
    });

    test('creates time entry with rate override', async () => {
      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        date: '2024-01-15',
        hours: 1.0,
        description: 'Special project',
        is_billable: true,
        override_rate: 400
      });

      const entries = await db.getTimeEntries();
      expect(entries[0].override_rate).toBe(400);
    });

    test('filters time entries by matter', async () => {
      const matter2Id = await db.createMatter({
        client_name: 'Client 2',
        matter_name: 'Matter 2',
        description: 'Matter 2',
        status: 'active'
      });

      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        date: '2024-01-15',
        hours: 1.0,
        description: 'Matter 1 work',
        is_billable: true
      });

      await db.createTimeEntry({
        matter_id: matter2Id,
        timekeeper_id: timekeeperId,
        date: '2024-01-16',
        hours: 2.0,
        description: 'Matter 2 work',
        is_billable: true
      });

      const matter1Entries = await db.getTimeEntries(matterId);
      expect(matter1Entries).toHaveLength(1);
      expect(matter1Entries[0].description).toBe('Matter 1 work');

      const allEntries = await db.getTimeEntries();
      expect(allEntries).toHaveLength(2);
    });

    test('sorts time entries by date desc, then created_at desc', async () => {
      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        date: '2024-01-10',
        hours: 1.0,
        description: 'Older work',
        is_billable: true
      });

      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        date: '2024-01-15',
        hours: 1.0,
        description: 'Newer work',
        is_billable: true
      });

      const entries = await db.getTimeEntries();
      expect(entries[0].description).toBe('Newer work');
      expect(entries[1].description).toBe('Older work');
    });
  });

  describe('Billing Summary', () => {
    let matterId: number;
    let partnerId: number;
    let associateId: number;

    beforeEach(async () => {
      matterId = await db.createMatter({
        client_name: 'Test Client',
        matter_name: 'Test Matter',
        description: 'Test matter',
        status: 'active'
      });

      partnerId = await db.createTimekeeper({
        name: 'Partner Smith',
        rate_tier: 'partner',
        standard_rate: 500
      });

      associateId = await db.createTimekeeper({
        name: 'Associate Jones',
        rate_tier: 'senior_associate',
        standard_rate: 300
      });
    });

    test('calculates billing summary correctly', async () => {
      // Partner billable time
      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: partnerId,
        date: '2024-01-15',
        hours: 3.0,
        description: 'Partner work',
        is_billable: true
      });

      // Associate billable time
      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: associateId,
        date: '2024-01-15',
        hours: 5.0,
        description: 'Associate work',
        is_billable: true
      });

      // Non-billable time
      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: partnerId,
        date: '2024-01-15',
        hours: 1.0,
        description: 'Admin work',
        is_billable: false
      });

      const summary = await db.getBillingSummary(matterId);

      expect(summary.total_billable_hours).toBe(8.0);
      expect(summary.total_non_billable_hours).toBe(1.0);
      expect(summary.total_billable_amount).toBe(3000); // (3 * 500) + (5 * 300)

      expect(summary.timekeeper_breakdown).toHaveLength(2);
      
      const partnerBreakdown = summary.timekeeper_breakdown.find(tk => tk.timekeeper_name === 'Partner Smith');
      expect(partnerBreakdown).toEqual({
        timekeeper_name: 'Partner Smith',
        billable_hours: 3.0,
        billable_amount: 1500,
        rate_used: 500
      });

      const associateBreakdown = summary.timekeeper_breakdown.find(tk => tk.timekeeper_name === 'Associate Jones');
      expect(associateBreakdown).toEqual({
        timekeeper_name: 'Associate Jones',
        billable_hours: 5.0,
        billable_amount: 1500,
        rate_used: 300
      });
    });

    test('uses rate override in billing calculation', async () => {
      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: partnerId,
        date: '2024-01-15',
        hours: 2.0,
        description: 'Special rate work',
        is_billable: true,
        override_rate: 600
      });

      const summary = await db.getBillingSummary(matterId);
      expect(summary.total_billable_amount).toBe(1200); // 2 * 600
      expect(summary.timekeeper_breakdown[0].rate_used).toBe(600);
    });

    test('uses matter rate override in billing calculation', async () => {
      // Set matter-specific rate for partner
      await db.setMatterRate(matterId, partnerId, 550);

      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: partnerId,
        date: '2024-01-15',
        hours: 2.0,
        description: 'Matter rate work',
        is_billable: true
      });

      const summary = await db.getBillingSummary(matterId);
      expect(summary.total_billable_amount).toBe(1100); // 2 * 550
      expect(summary.timekeeper_breakdown[0].rate_used).toBe(550);
    });

    test('entry override takes precedence over matter rate', async () => {
      // Set matter rate
      await db.setMatterRate(matterId, partnerId, 550);

      // Entry with override should use override rate, not matter rate
      await db.createTimeEntry({
        matter_id: matterId,
        timekeeper_id: partnerId,
        date: '2024-01-15',
        hours: 2.0,
        description: 'Override rate work',
        is_billable: true,
        override_rate: 600
      });

      const summary = await db.getBillingSummary(matterId);
      expect(summary.total_billable_amount).toBe(1200); // 2 * 600 (not 550)
      expect(summary.timekeeper_breakdown[0].rate_used).toBe(600);
    });
  });

  describe('Matter Rate Management', () => {
    let matterId: number;
    let timekeeperId: number;

    beforeEach(async () => {
      matterId = await db.createMatter({
        client_name: 'Test Client',
        matter_name: 'Test Matter',
        description: 'Test matter',
        status: 'active'
      });

      timekeeperId = await db.createTimekeeper({
        name: 'Test Lawyer',
        rate_tier: 'partner',
        standard_rate: 500
      });
    });

    test('sets matter rate override', async () => {
      await db.setMatterRate(matterId, timekeeperId, 550);

      const matterRate = await db.getMatterRate(matterId, timekeeperId);
      expect(matterRate).toMatchObject({
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        override_rate: 550
      });
      expect(matterRate!.id).toBeDefined();
      expect(matterRate!.created_at).toBeDefined();
    });

    test('updates existing matter rate override', async () => {
      await db.setMatterRate(matterId, timekeeperId, 550);
      await db.setMatterRate(matterId, timekeeperId, 575);

      const matterRate = await db.getMatterRate(matterId, timekeeperId);
      expect(matterRate!.override_rate).toBe(575);

      // Should only have one record, not create duplicate
      const allMatterRates = JSON.parse(localStorage.getItem('matter_rates') || '[]');
      const matchingRates = allMatterRates.filter((mr: MatterRate) => 
        mr.matter_id === matterId && mr.timekeeper_id === timekeeperId
      );
      expect(matchingRates).toHaveLength(1);
    });

    test('returns null for non-existent matter rate', async () => {
      const matterRate = await db.getMatterRate(999, 999);
      expect(matterRate).toBeNull();
    });
  });
});