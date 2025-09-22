// Core Types for Team1 Nexus
import type { RoleBucket } from './rbac/roleBuckets';

export type ID = string;
export type Role = 'admin' | 'manager' | 'developer' | 'internal' | 'employee' | 'production' | 'shipping_receiving' | 'customer';

export interface User {
  id: ID;
  email: string;
  role: Role;
  name?: string;
}

// Database types aligned with Supabase schema
export interface DbCustomer {
  id: string;
  org_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DbProject {
  id: string;
  org_id: string;
  customer_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'quoted' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  budget?: number;
  progress: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Customer {
  id: ID;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export type ProjectStatus = 'draft' | 'quoted' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id: ID;
  customerId: ID;
  title: string;
  status: ProjectStatus;
  owner?: string;
  due?: string;
  quoteId?: ID;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: ID;
  customerId: ID;
  projectId?: ID;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: ID;
  customerId?: ID;
  projectId?: ID;
  subject: string;
  body: string;
  from: string;
  to: string[];
  type: 'email' | 'note' | 'system';
  createdAt: string;
}

export interface Document {
  id: ID;
  entity: {
    type: 'project' | 'customer' | 'shipment' | 'workorder' | 'message';
    id: ID;
  };
  name: string;
  size: number;
  mime: string;
  url: string;
  createdAt: string;
  uploader: string;
}

export interface WorkOrder {
  id: ID;
  projectId: ID;
  status: 'queued' | 'wip' | 'paused' | 'done';
  qty?: number;
  createdAt: string;
}

export interface Shipment {
  id: ID;
  projectId?: ID;
  carrier?: string;
  address: string;
  items: Array<{ sku: string; qty: number; weight?: number }>;
  status: 'created' | 'in_transit' | 'delivered';
  createdAt: string;
  deliveredAt?: string;
}

export interface CarrierAppt {
  id: ID;
  carrier: string;
  windowStart: string;
  windowEnd: string;
  ref?: string;
}

export interface Label {
  id: ID;
  scope: 'customer'|'user'|'org';
  name: string;
  color: string;
  slug: string;
  createdAt: string;
}

// Event System Types
export type EventType = 'quote.submitted' | 'quote.sent' | 'production.qty_reported' | 'shipment.delivered' | 'labor.entry_created';

export interface EventV1<T = unknown> {
  version: '1';
  id: ID;
  ts: string;
  type: EventType;
  source: 'portal.web';
  targets: Array<'toInternal' | 'toProduction' | 'toSnR' | 'toCustomer'>;
  actor: { role: Role; userId?: ID };
  org: { id: ID; name: string };
  data: T;
  meta: { trace_id: ID; env: 'dev' | 'demo' };
}