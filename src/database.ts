export interface Client {
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

export interface Matter {
  id: number;
  client_id: number;
  client_name: string;
  matter_number: string;
  matter_name: string;
  description: string;
  status: 'active' | 'closed' | 'on_hold';
  created_at: string;
}

export interface Timekeeper {
  id: number;
  name: string;
  rate_tier: 'partner' | 'senior_associate' | 'junior_associate' | 'paralegal';
  standard_rate: number;
  created_at: string;
}

export interface TimeEntry {
  id: number;
  matter_id: number;
  timekeeper_id: number;
  date: string;
  hours: number;
  description: string;
  is_billable: boolean;
  override_rate?: number;
  created_at: string;
}

export interface MatterRate {
  id: number;
  matter_id: number;
  timekeeper_id: number;
  override_rate: number;
  created_at: string;
}

export class Database {
  private getNextId(storeName: string): number {
    const items = this.getFromStorage(storeName);
    return items.length === 0 ? 1 : Math.max(...items.map((item: any) => item.id)) + 1;
  }

  private getFromStorage(key: string): any[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(key: string, data: any[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  constructor() {
    this.init();
  }

  private async init() {
    console.log('Database initialized successfully with localStorage');
  }

  // Matter operations
  async createMatter(matterData: {
    client_id: number;
    matter_name: string;
    description: string;
    status?: 'active' | 'closed' | 'on_hold';
  }): Promise<Matter> {
    // Validate client exists
    const client = await this.getClient(matterData.client_id);
    if (!client) {
      throw new Error('Client not found');
    }

    const matters = this.getFromStorage('matters');
    
    // Generate next matter number for this client
    const clientMatters = matters.filter((m: Matter) => m.client_id === matterData.client_id);
    const nextMatterNumber = clientMatters.length.toString().padStart(4, '0');

    const id = this.getNextId('matters');
    const newMatter: Matter = {
      id,
      client_id: matterData.client_id,
      client_name: client.name, // Keep for backward compatibility
      matter_number: nextMatterNumber,
      matter_name: matterData.matter_name,
      description: matterData.description,
      status: matterData.status || 'active',
      created_at: new Date().toISOString()
    };
    
    matters.push(newMatter);
    this.saveToStorage('matters', matters);
    return newMatter;
  }

  async getMatters(): Promise<Matter[]> {
    const matters = this.getFromStorage('matters');
    return matters.sort((a: Matter, b: Matter) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getMatter(id: number): Promise<Matter> {
    const matters = this.getFromStorage('matters');
    return matters.find((m: Matter) => m.id === id);
  }

  async updateMatter(id: number, updates: Partial<Omit<Matter, 'id' | 'created_at' | 'matter_number'>>): Promise<void> {
    const matters = this.getFromStorage('matters');
    const matterIndex = matters.findIndex((m: Matter) => m.id === id);
    
    if (matterIndex === -1) {
      throw new Error('Matter not found');
    }

    // Update the matter while preserving id, created_at, and matter_number
    matters[matterIndex] = {
      ...matters[matterIndex],
      ...updates
    };

    this.saveToStorage('matters', matters);
  }

  async getUniqueClients(): Promise<string[]> {
    const matters = this.getFromStorage('matters');
    const clients = matters.map((m: Matter) => m.client_name);
    return Array.from(new Set(clients)).sort();
  }

  // Timekeeper operations
  async createTimekeeper(timekeeper: Omit<Timekeeper, 'id' | 'created_at'>): Promise<number> {
    const timekeepers = this.getFromStorage('timekeepers');
    const id = this.getNextId('timekeepers');
    const newTimekeeper: Timekeeper = {
      ...timekeeper,
      id,
      created_at: new Date().toISOString()
    };
    
    timekeepers.push(newTimekeeper);
    this.saveToStorage('timekeepers', timekeepers);
    return id;
  }

  async getTimekeepers(): Promise<Timekeeper[]> {
    const timekeepers = this.getFromStorage('timekeepers');
    return timekeepers.sort((a: Timekeeper, b: Timekeeper) => a.name.localeCompare(b.name));
  }

  // Time entry operations
  async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at'>): Promise<number> {
    const entries = this.getFromStorage('time_entries');
    const id = this.getNextId('time_entries');
    const newEntry: TimeEntry = {
      ...entry,
      id,
      created_at: new Date().toISOString()
    };
    
    entries.push(newEntry);
    this.saveToStorage('time_entries', entries);
    return id;
  }

  async getTimeEntries(matterId?: number): Promise<(TimeEntry & { timekeeper_name: string; client_name: string; matter_number: string; matter_name: string })[]> {
    const entries = this.getFromStorage('time_entries');
    const timekeepers = this.getFromStorage('timekeepers');
    const matters = this.getFromStorage('matters');

    let filteredEntries = entries;
    if (matterId) {
      filteredEntries = entries.filter((entry: TimeEntry) => entry.matter_id === matterId);
    }

    const enrichedEntries = filteredEntries.map((entry: TimeEntry) => {
      const timekeeper = timekeepers.find((t: Timekeeper) => t.id === entry.timekeeper_id);
      const matter = matters.find((m: Matter) => m.id === entry.matter_id);
      
      return {
        ...entry,
        timekeeper_name: timekeeper?.name || 'Unknown',
        client_name: matter?.client_name || 'Unknown',
        matter_number: matter?.matter_number || 'Unknown',
        matter_name: matter?.matter_name || 'Unknown'
      };
    });

    return enrichedEntries.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare === 0) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return dateCompare;
    });
  }

  async getBillingSummary(matterId: number): Promise<{
    total_billable_hours: number;
    total_non_billable_hours: number;
    total_billable_amount: number;
    timekeeper_breakdown: {
      timekeeper_name: string;
      billable_hours: number;
      billable_amount: number;
      rate_used: number;
    }[];
  }> {
    const entries = this.getFromStorage('time_entries').filter((entry: TimeEntry) => entry.matter_id === matterId);
    const timekeepers = this.getFromStorage('timekeepers');
    const matterRates = this.getFromStorage('matter_rates');

    let totalBillableHours = 0;
    let totalNonBillableHours = 0;
    let totalBillableAmount = 0;
    
    const timekeeperBreakdown: { [key: string]: { 
      timekeeper_name: string; 
      billable_hours: number; 
      billable_amount: number; 
      rate_used: number; 
    }} = {};

    entries.forEach((entry: TimeEntry) => {
      const timekeeper = timekeepers.find((t: Timekeeper) => t.id === entry.timekeeper_id);
      const matterRate = matterRates.find((mr: MatterRate) => 
        mr.matter_id === entry.matter_id && mr.timekeeper_id === entry.timekeeper_id
      );

      const rate = entry.override_rate || matterRate?.override_rate || timekeeper?.standard_rate || 0;
      
      if (entry.is_billable) {
        totalBillableHours += entry.hours;
        totalBillableAmount += entry.hours * rate;
        
        const timekeeperId = entry.timekeeper_id.toString();
        if (!timekeeperBreakdown[timekeeperId]) {
          timekeeperBreakdown[timekeeperId] = {
            timekeeper_name: timekeeper?.name || 'Unknown',
            billable_hours: 0,
            billable_amount: 0,
            rate_used: rate
          };
        }
        
        timekeeperBreakdown[timekeeperId].billable_hours += entry.hours;
        timekeeperBreakdown[timekeeperId].billable_amount += entry.hours * rate;
      } else {
        totalNonBillableHours += entry.hours;
      }
    });

    return {
      total_billable_hours: totalBillableHours,
      total_non_billable_hours: totalNonBillableHours,
      total_billable_amount: totalBillableAmount,
      timekeeper_breakdown: Object.values(timekeeperBreakdown)
    };
  }

  // Matter rate overrides
  async setMatterRate(matterId: number, timekeeperId: number, overrideRate: number): Promise<void> {
    const matterRates = this.getFromStorage('matter_rates');
    const existingIndex = matterRates.findIndex((mr: MatterRate) => 
      mr.matter_id === matterId && mr.timekeeper_id === timekeeperId
    );

    if (existingIndex >= 0) {
      matterRates[existingIndex].override_rate = overrideRate;
    } else {
      const id = this.getNextId('matter_rates');
      const newMatterRate: MatterRate = {
        id,
        matter_id: matterId,
        timekeeper_id: timekeeperId,
        override_rate: overrideRate,
        created_at: new Date().toISOString()
      };
      matterRates.push(newMatterRate);
    }

    this.saveToStorage('matter_rates', matterRates);
  }

  async getMatterRate(matterId: number, timekeeperId: number): Promise<MatterRate | null> {
    const matterRates = this.getFromStorage('matter_rates');
    return matterRates.find((mr: MatterRate) => 
      mr.matter_id === matterId && mr.timekeeper_id === timekeeperId
    ) || null;
  }

  // Time entry edit/delete operations
  async updateTimeEntry(id: number, updates: Partial<Omit<TimeEntry, 'id' | 'created_at'>>): Promise<void> {
    const entries = this.getFromStorage('time_entries');
    const entryIndex = entries.findIndex((entry: TimeEntry) => entry.id === id);
    
    if (entryIndex === -1) {
      throw new Error('Time entry not found');
    }

    entries[entryIndex] = {
      ...entries[entryIndex],
      ...updates
    };

    this.saveToStorage('time_entries', entries);
  }

  async deleteTimeEntry(id: number): Promise<void> {
    const entries = this.getFromStorage('time_entries');
    const filteredEntries = entries.filter((entry: TimeEntry) => entry.id !== id);
    
    if (filteredEntries.length === entries.length) {
      throw new Error('Time entry not found');
    }

    this.saveToStorage('time_entries', filteredEntries);
  }

  async getTimeEntry(id: number): Promise<TimeEntry | null> {
    const entries = this.getFromStorage('time_entries');
    return entries.find((entry: TimeEntry) => entry.id === id) || null;
  }

  // Client operations
  async createClient(clientData: {
    name: string;
    description?: string;
    address?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
  }): Promise<Client> {
    const clients = this.getFromStorage('clients');
    
    // Generate next client number based on current count
    const nextClientNumber = clients.length.toString().padStart(6, '0');

    const id = this.getNextId('clients');
    const newClient: Client = {
      id,
      client_number: nextClientNumber,
      name: clientData.name,
      description: clientData.description || '',
      address: clientData.address || '',
      contact_name: clientData.contact_name || '',
      contact_phone: clientData.contact_phone || '',
      contact_email: clientData.contact_email || '',
      created_at: new Date().toISOString()
    };
    
    clients.push(newClient);
    this.saveToStorage('clients', clients);
    return newClient;
  }

  async getClients(): Promise<Client[]> {
    const clients = this.getFromStorage('clients');
    return clients.sort((a: Client, b: Client) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getClient(id: number): Promise<Client | null> {
    const clients = this.getFromStorage('clients');
    return clients.find((c: Client) => c.id === id) || null;
  }

  async updateClient(id: number, updates: Partial<Omit<Client, 'id' | 'client_number' | 'created_at'>>): Promise<void> {
    const clients = this.getFromStorage('clients');
    const clientIndex = clients.findIndex((c: Client) => c.id === id);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }

    clients[clientIndex] = { ...clients[clientIndex], ...updates };
    this.saveToStorage('clients', clients);
  }

  async deleteClient(id: number): Promise<void> {
    const clients = this.getFromStorage('clients');
    const clientIndex = clients.findIndex((c: Client) => c.id === id);
    
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }

    // Delete associated matters first (cascade delete)
    const matters = this.getFromStorage('matters');
    const filteredMatters = matters.filter((m: Matter) => m.client_id !== id);
    this.saveToStorage('matters', filteredMatters);

    // Delete the client
    clients.splice(clientIndex, 1);
    this.saveToStorage('clients', clients);
  }

  async searchClients(query: string): Promise<Client[]> {
    const clients = this.getFromStorage('clients');
    if (!query.trim()) {
      return clients;
    }
    
    const lowerQuery = query.toLowerCase();
    return clients.filter((c: Client) => 
      c.name.toLowerCase().includes(lowerQuery)
    );
  }

  async clientNameExists(name: string, excludeId?: number): Promise<boolean> {
    const clients = this.getFromStorage('clients');
    return clients.some((c: Client) => 
      c.name === name && c.id !== excludeId
    );
  }

  async getClientsSorted(sortBy: 'name' | 'created'): Promise<Client[]> {
    const clients = this.getFromStorage('clients');
    
    if (sortBy === 'name') {
      return clients.sort((a: Client, b: Client) => 
        a.name.localeCompare(b.name)
      );
    } else {
      // Sort by created date, newest first
      return clients.sort((a: Client, b: Client) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }

  async getMattersForClient(clientId: number): Promise<Matter[]> {
    const matters = this.getFromStorage('matters');
    return matters.filter((m: Matter) => m.client_id === clientId);
  }
}

export const database = new Database();