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
  
  const MemoizedChild = React.useMemo(() => {
    if (memoizationEnabled) {
      return React.memo(children as React.ComponentType<any>);
    }
    return children;
  }, [children, memoizationEnabled, ...dependencies]);

  if (!memoizationEnabled && fallback) {
    return <>{fallback}</>;
  }

  return <>{MemoizedChild}</>;
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

