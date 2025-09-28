import React from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface MemoizedComponentProps {
  children: React.ReactNode;
  dependencies?: React.DependencyList;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that conditionally applies React.memo based on feature flag
 */
export function MemoizedComponent({ 
  children, 
  dependencies = [], 
  fallback 
}: MemoizedComponentProps) {
  const [memoizationEnabled] = useFeatureFlag('performance.memoization');
  
  if (!memoizationEnabled) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

/**
 * Hook that conditionally applies useMemo based on feature flag
 */
export function useConditionalMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const [memoizationEnabled] = useFeatureFlag('performance.memoization');
  
  if (memoizationEnabled) {
    return React.useMemo(factory, deps);
  }
  
  return factory();
}

/**
 * Hook that conditionally applies useCallback based on feature flag
 */
export function useConditionalCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const [memoizationEnabled] = useFeatureFlag('performance.memoization');
  
  if (memoizationEnabled) {
    return React.useCallback(callback, deps);
  }
  
  return callback;
}

