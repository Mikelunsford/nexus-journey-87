// localStorage wrapper with versioning
const DB_VERSION = 1;
const DB_KEY = `tnx-db:v${DB_VERSION}`;

export interface StorageData {
  version: number;
  users: any[];
  customers: any[];
  projects: any[];
  quotes: any[];
  messages: any[];
  documents: any[];
  workOrders: any[];
  shipments: any[];
  carrierAppts: any[];
}

export function getStorageData(): StorageData | null {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStorageData(data: StorageData): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function clearStorageData(): void {
  localStorage.removeItem(DB_KEY);
}