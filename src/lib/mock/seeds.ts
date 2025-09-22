import { ulid } from '../ids';
import type { 
  Customer, 
  Project, 
  Quote, 
  Message, 
  Document, 
  WorkOrder, 
  Shipment, 
  CarrierAppt,
  User,
  Label 
} from '../types';

export function createMockData() {
  const now = new Date().toISOString();
  
  // Create users
  const users: User[] = [
    { id: ulid(), email: 'admin@team1.com', role: 'admin', name: 'Admin User' },
    { id: ulid(), email: 'manager@team1.com', role: 'manager', name: 'Manager User' },
    { id: ulid(), email: 'developer@team1.com', role: 'developer', name: 'Developer User' },
    { id: ulid(), email: 'internal@team1.com', role: 'internal', name: 'Internal User' },
    { id: ulid(), email: 'employee@team1.com', role: 'employee', name: 'Employee User' },
    { id: ulid(), email: 'production@team1.com', role: 'production', name: 'Production User' },
    { id: ulid(), email: 'shipping@team1.com', role: 'shipping_receiving', name: 'Shipping User' },
    { id: ulid(), email: 'customer@acme.com', role: 'customer', name: 'Customer User' },
  ];

  // Create customers
  const customers: Customer[] = Array.from({ length: 20 }, (_, i) => ({
    id: ulid(),
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phone: `555-${String(i + 1).padStart(4, '0')}`,
    address: `${100 + i} Main St, Little Rock, AR 72201`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  // Create quotes
  const quotes: Quote[] = Array.from({ length: 20 }, (_, i) => ({
    id: ulid(),
    customerId: customers[Math.floor(Math.random() * customers.length)].id,
    total: Math.floor(Math.random() * 50000) + 5000,
    status: ['draft', 'sent', 'approved', 'rejected'][Math.floor(Math.random() * 4)] as any,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  // Create projects
  const projects: Project[] = Array.from({ length: 40 }, (_, i) => {
    const customerId = customers[Math.floor(Math.random() * customers.length)].id;
    const approvedQuote = quotes.find(q => q.customerId === customerId && q.status === 'approved');
    
    return {
      id: ulid(),
      customerId,
      title: `Project ${i + 1}`,
      status: ['draft', 'quoted', 'approved', 'in_progress', 'on_hold', 'completed', 'archived'][Math.floor(Math.random() * 7)] as any,
      owner: users[Math.floor(Math.random() * 5)].name,
      due: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      quoteId: approvedQuote?.id,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Create messages
  const messages: Message[] = Array.from({ length: 30 }, (_, i) => ({
    id: ulid(),
    customerId: customers[Math.floor(Math.random() * customers.length)].id,
    projectId: Math.random() > 0.5 ? projects[Math.floor(Math.random() * projects.length)].id : undefined,
    subject: `Message ${i + 1}`,
    body: `This is message content for message ${i + 1}`,
    from: 'system@team1.com',
    to: ['customer@example.com'],
    type: ['email', 'note', 'system'][Math.floor(Math.random() * 3)] as any,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  // Create documents
  const documents: Document[] = Array.from({ length: 25 }, (_, i) => ({
    id: ulid(),
    entity: {
      type: ['project', 'customer', 'shipment'][Math.floor(Math.random() * 3)] as any,
      id: projects[Math.floor(Math.random() * projects.length)].id,
    },
    name: `document-${i + 1}.pdf`,
    size: Math.floor(Math.random() * 5000000) + 100000,
    mime: 'application/pdf',
    url: `#document-${i + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    uploader: users[Math.floor(Math.random() * users.length)].name || 'Unknown',
  }));

  // Create work orders
  const workOrders: WorkOrder[] = Array.from({ length: 10 }, (_, i) => ({
    id: ulid(),
    projectId: projects[Math.floor(Math.random() * projects.length)].id,
    status: ['queued', 'wip', 'paused', 'done'][Math.floor(Math.random() * 4)] as any,
    qty: Math.floor(Math.random() * 100) + 1,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  // Create shipments
  const shipments: Shipment[] = Array.from({ length: 10 }, (_, i) => ({
    id: ulid(),
    projectId: Math.random() > 0.3 ? projects[Math.floor(Math.random() * projects.length)].id : undefined,
    carrier: ['FedEx', 'UPS', 'USPS', 'DHL'][Math.floor(Math.random() * 4)],
    address: customers[Math.floor(Math.random() * customers.length)].address || '',
    items: [{ sku: `SKU-${i + 1}`, qty: Math.floor(Math.random() * 10) + 1 }],
    status: ['created', 'in_transit', 'delivered'][Math.floor(Math.random() * 3)] as any,
    createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
  }));

  // Create carrier appointments
  const carrierAppts: CarrierAppt[] = Array.from({ length: 5 }, (_, i) => {
    const start = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    
    return {
      id: ulid(),
      carrier: ['FedEx', 'UPS', 'USPS', 'DHL'][Math.floor(Math.random() * 4)],
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      ref: `REF-${i + 1}`,
    };
  });

  // Create labels
  const labels: Label[] = [
    { id: ulid(), scope: 'customer', name: 'VIP', color: '#E02525', slug: 'vip', createdAt: now },
    { id: ulid(), scope: 'customer', name: 'New Customer', color: '#2B8AF7', slug: 'new-customer', createdAt: now },
    { id: ulid(), scope: 'customer', name: 'Large Volume', color: '#16A34A', slug: 'large-volume', createdAt: now },
    { id: ulid(), scope: 'user', name: 'Team Lead', color: '#F59E0B', slug: 'team-lead', createdAt: now },
    { id: ulid(), scope: 'user', name: 'Contractor', color: '#6B7280', slug: 'contractor', createdAt: now },
    { id: ulid(), scope: 'org', name: 'Premium Tier', color: '#E02525', slug: 'premium-tier', createdAt: now },
    { id: ulid(), scope: 'org', name: 'Partner', color: '#16A34A', slug: 'partner', createdAt: now },
  ];

  return {
    version: 1,
    users,
    customers,
    projects,
    quotes,
    messages,
    documents,
    workOrders,
    shipments,
    carrierAppts,
    labels,
  };
}