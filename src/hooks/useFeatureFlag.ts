import { useState, useEffect } from 'react';
import { getFeatureFlag, setFeatureFlag, type FeatureFlags } from '@/lib/featureFlags';

export function useFeatureFlag<T extends keyof FeatureFlags>(
  flag: T
): [FeatureFlags[T], (value: FeatureFlags[T]) => void] {
  const [value, setValue] = useState<FeatureFlags[T]>(() => getFeatureFlag(flag));

  const updateFlag = (newValue: FeatureFlags[T]) => {
    setValue(newValue);
    setFeatureFlag(flag, newValue);
  };

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `feature_flag_${flag}` && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch {
          // Ignore invalid JSON
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [flag]);

  return [value, updateFlag];
}