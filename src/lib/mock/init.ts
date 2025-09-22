import { getStorageData, setStorageData } from '../storage';
import { createMockData } from './seeds';

export function initializeMockData() {
  const existingData = getStorageData();
  
  if (!existingData) {
    console.log('Initializing mock data...');
    const mockData = createMockData();
    setStorageData(mockData);
    console.log('Mock data initialized:', mockData);
  } else {
    console.log('Using existing mock data:', existingData);
  }
}