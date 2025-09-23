import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCustomers } from '@/hooks/useCustomers';
import { useProjects } from '@/hooks/useProjects';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { StatusBar } from '@/components/ui/StatusBar';
import { StatusPill } from '@/components/ui/StatusPill';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function Dashboard() {
  const { profile } = useAuth();
  const { customers } = useCustomers();
  const { projects } = useProjects();
  const [brandV1Enabled] = useFeatureFlag('ui.brand_v1');

  const quickActions: QAItem[] = [
    {
      label: 'Submit New Quote to Team1',
      to: '/dashboard/projects/new-internal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Add Project Information',
      to: '/dashboard/projects/new-project',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
        </svg>
      ),
    },
    {
      label: 'Import CSV',
      to: '/dashboard/settings/import',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      label: 'Invite User',
      to: '/dashboard/admin/users/invite',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">
          Welcome back, {profile?.name || 'User'}
        </h1>
        <p className="t-dim mt-2">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Active Projects</p>
              <p className="text-2xl font-bold t-primary">{projects.filter(p => ['in_progress', 'approved'].includes(p.status)).length}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-brand-blue/10' : 'bg-t1-blue/10'}`}>
              <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-brand-blue' : 't1-blue'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Pending Quotes</p>
              <p className="text-2xl font-bold t-primary">8</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-brand-red/10' : 'bg-t1-red/10'}`}>
              <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-brand-red' : 'text-t1-red'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Active Shipments</p>
              <p className="text-2xl font-bold t-primary">12</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-green-600/10 dark:bg-green-500/10' : 'bg-green-500/10'}`}>
              <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-green-600 dark:text-green-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Team Members</p>
              <p className="text-2xl font-bold t-primary">47</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-purple-600/10 dark:bg-purple-500/10' : 'bg-purple-500/10'}`}>
              <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-purple-600 dark:text-purple-500' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold t-primary mb-4">
          Quick Actions
        </h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Performance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface panel panel-body">
          <h3 className="text-lg font-semibold t-primary mb-4">
            Performance Status
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm t-dim">Production Efficiency</span>
                <span className="text-sm font-medium t-primary">87%</span>
              </div>
              <StatusBar tone="brand" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm t-dim">On-Time Delivery</span>
                <span className="text-sm font-medium t-primary">94%</span>
              </div>
              <StatusBar tone="brand" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm t-dim">Quality Score</span>
                <span className="text-sm font-medium t-primary">78%</span>
              </div>
              <StatusBar tone="brand" />
            </div>
          </div>
        </div>

        <div className="card-surface panel panel-body">
          <h3 className="text-lg font-semibold t-primary mb-4">
            Top Priorities
          </h3>
          <div className="space-y-3">
            <div className="prio-row">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium t-primary">Project Alpha</p>
                  <p className="text-sm t-dim">Customer: ACME Corp</p>
                </div>
                <StatusPill tone="warn">Due Soon</StatusPill>
              </div>
            </div>
            <div className="prio-row">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium t-primary">Shipment #1234</p>
                  <p className="text-sm t-dim">Destination: Little Rock</p>
                </div>
                <StatusPill tone="info">In Transit</StatusPill>
              </div>
            </div>
            <div className="prio-row">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium t-primary">Quality Review</p>
                  <p className="text-sm t-dim">Production Line 2</p>
                </div>
                <StatusPill tone="err">Action Required</StatusPill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}