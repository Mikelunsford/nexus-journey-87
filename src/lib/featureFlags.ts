export interface FeatureFlags {
  'ui.brand_v1': boolean;
  'ui.enable_test_seeds': boolean;
  'performance.virtualization': boolean;
  'performance.memoization': boolean;
  'performance.lazy_loading': boolean;
}

// Default feature flag values
const defaultFlags: FeatureFlags = {
  'ui.brand_v1': true, // Enable by default for development
  'ui.enable_test_seeds': true, // Enable by default for development, disable in production
  'performance.virtualization': true, // Enable virtualization for large lists
  'performance.memoization': true, // Enable memoization for expensive operations
  'performance.lazy_loading': true, // Enable lazy loading for components
};

// Get feature flag from localStorage or use default
export function getFeatureFlag<T extends keyof FeatureFlags>(
  flag: T
): FeatureFlags[T] {
  try {
    const stored = localStorage.getItem(`feature_flag_${flag}`);
    return stored !== null ? JSON.parse(stored) : defaultFlags[flag];
  } catch {
    return defaultFlags[flag];
  }
}

// Set feature flag in localStorage
export function setFeatureFlag<T extends keyof FeatureFlags>(
  flag: T,
  value: FeatureFlags[T]
): void {
  try {
    localStorage.setItem(`feature_flag_${flag}`, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Toggle feature flag
export function toggleFeatureFlag<T extends keyof FeatureFlags>(
  flag: T
): FeatureFlags[T] {
  const current = getFeatureFlag(flag);
  const newValue = !current as FeatureFlags[T];
  setFeatureFlag(flag, newValue);
  return newValue;
}