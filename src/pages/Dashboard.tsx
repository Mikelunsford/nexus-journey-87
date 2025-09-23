import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCustomers } from '@/hooks/useCustomers';
import { useProjects } from '@/hooks/useProjects';
import { useQuotes } from '@/hooks/useQuotes';
import { useShipments } from '@/hooks/useShipments';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { getDashboardCounts } from '@/services/dashboardService';
import QuickActionsGrid, { type QAItem } from '@/components/ui/QuickActionsGrid';
import { StatusBar } from '@/components/ui/StatusBar';
import { StatusPill } from '@/components/ui/StatusPill';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import TestToolsPanel from '@/components/ui/TestToolsPanel';
import { useTestActions } from '@/hooks/useTestActions';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { customers } = useCustomers();
  const { projects } = useProjects();
  const { quotes } = useQuotes();
  const { shipments } = useShipments();
  const { teamMembers } = useTeamMembers();
  const [brandV1Enabled] = useFeatureFlag('ui.brand_v1');
  const { generateTestEntity } = useTestActions();
  const [dashboardCounts, setDashboardCounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard counts with real-time updates
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.org_id) return;
      
      try {
        const counts = await getDashboardCounts(user.org_id);
        setDashboardCounts(counts);
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();

    // Set up real-time subscriptions for live updates
    if (user?.org_id) {
      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `org_id=eq.${user.org_id}`
          },
          () => fetchCounts()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quotes',
            filter: `org_id=eq.${user.org_id}`
          },
          () => fetchCounts()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'shipments',
            filter: `org_id=eq.${user.org_id}`
          },
          () => fetchCounts()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.org_id]);

  const quickActions: QAItem[] = [
    {
      label: 'Submit New Quote to Team1',
      to: '/dashboard/quotes/new',
      caption: 'Request pricing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Import CSV',
      to: '/dashboard/settings/import',
      caption: 'Bulk data import',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      label: 'Add Project Information',
      to: '/dashboard/projects/new?mode=light',
      caption: 'Quick project setup',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
        </svg>
      ),
    },
    {
      label: 'Invite User',
      to: '/dashboard/team/invite',
      caption: 'Add team member',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
  ];

  // Use real-time counts from service layer
  const activeProjects = dashboardCounts?.activeProjects ?? 0;
  const pendingQuotes = dashboardCounts?.pendingQuotes ?? 0;
  const activeShipments = dashboardCounts?.activeShipments ?? 0;
  const teamMembersCount = dashboardCounts?.teamMembers ?? 0;

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

      {/* Live KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/dashboard/projects?status=active" className="block">
          <div className="kpi hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm t-dim">Active Projects</p>
                <p className="text-2xl font-bold t-primary">{loading ? '...' : activeProjects}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-brand-blue/10' : 'bg-t1-blue/10'}`}>
                <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-brand-blue' : 't1-blue'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/quotes?status=pending" className="block">
          <div className="kpi hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm t-dim">Pending Quotes</p>
                <p className="text-2xl font-bold t-primary">{loading ? '...' : pendingQuotes}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-brand-red/10' : 'bg-t1-red/10'}`}>
                <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-brand-red' : 'text-t1-red'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/shipments?status=active" className="block">
          <div className="kpi hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm t-dim">Active Shipments</p>
                <p className="text-2xl font-bold t-primary">{loading ? '...' : activeShipments}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-green-600/10 dark:bg-green-500/10' : 'bg-green-500/10'}`}>
                <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-green-600 dark:text-green-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/team" className="block">
          <div className="kpi hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm t-dim">Team Members</p>
                <p className="text-2xl font-bold t-primary">{loading ? '...' : teamMembersCount}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${brandV1Enabled ? 'bg-purple-600/10 dark:bg-purple-500/10' : 'bg-purple-500/10'}`}>
                <svg className={`w-6 h-6 ${brandV1Enabled ? 'text-purple-600 dark:text-purple-500' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold t-primary mb-4">
          Quick Actions
        </h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Test Tools Panel */}
      <TestToolsPanel />
    </div>
  );
}