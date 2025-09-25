import React, { Suspense } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Skeleton } from './skeleton';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeleton?: React.ReactNode;
}

/**
 * Wrapper component that conditionally applies lazy loading based on feature flag
 */
export function LazyWrapper({ 
  children, 
  fallback = <div>Loading...</div>,
  skeleton = <Skeleton className="h-4 w-full" />
}: LazyWrapperProps) {
  const [lazyLoadingEnabled] = useFeatureFlag('performance.lazy_loading');
  
  if (lazyLoadingEnabled) {
    return (
      <Suspense fallback={skeleton}>
        {children}
      </Suspense>
    );
  }
  
  return <>{children}</>;
}

/**
 * Higher-order component that wraps a component with lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(() => 
    Promise.resolve({ default: Component })
  );
  
  return function WrappedComponent(props: P) {
    const [lazyLoadingEnabled] = useFeatureFlag('performance.lazy_loading');
    
    if (lazyLoadingEnabled) {
      return (
        <Suspense fallback={fallback || <Skeleton className="h-4 w-full" />}>
          <LazyComponent {...props} />
        </Suspense>
      );
    }
    
    return <Component {...props} />;
  };
}

