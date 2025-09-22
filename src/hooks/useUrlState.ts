import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export function useUrlState<T extends Record<string, any>>(
  defaultState: T,
  debounceMs: number = 300
): [T, (updates: Partial<T>) => void, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const urlState: Partial<T> = {};
    
    for (const [key, defaultValue] of Object.entries(defaultState)) {
      const urlValue = searchParams.get(key);
      
      if (urlValue !== null) {
        // Parse the URL value based on the default value type
        if (typeof defaultValue === 'boolean') {
          urlState[key as keyof T] = (urlValue === 'true') as any;
        } else if (typeof defaultValue === 'number') {
          const parsed = Number(urlValue);
          urlState[key as keyof T] = (isNaN(parsed) ? defaultValue : parsed) as any;
        } else if (Array.isArray(defaultValue)) {
          urlState[key as keyof T] = (urlValue ? urlValue.split(',') : defaultValue) as any;
        } else {
          urlState[key as keyof T] = urlValue as any;
        }
      }
    }
    
    return { ...defaultState, ...urlState };
  }, [searchParams, defaultState]);

  const updateState = useCallback((updates: Partial<T>) => {
    const newParams = new URLSearchParams(searchParams);
    
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === defaultState[key]) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          newParams.set(key, value.join(','));
        } else {
          newParams.delete(key);
        }
      } else {
        newParams.set(key, String(value));
      }
    }
    
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, defaultState]);

  const resetState = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return [state, updateState, resetState];
}