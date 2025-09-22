import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-ink dark:text-brand-paper mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-brand-ink dark:text-brand-paper mb-4">
          Page Not Found
        </h2>
        <p className="text-brand-gray mb-8 max-w-md">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <Button asChild>
          <Link to="/dashboard">
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}