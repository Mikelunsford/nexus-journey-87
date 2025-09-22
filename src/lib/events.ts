export type EventType = 'quote.submitted' | 'quote.sent' | 'production.qty_reported' | 'shipment.delivered' | 'labor.entry_created';

export interface EventV1<T = any> {
  version: '1';
  id: string;
  ts: string;
  type: EventType;
  source: 'portal.web';
  targets: Array<'toInternal' | 'toProduction' | 'toSnR' | 'toCustomer'>;
  actor: { role: any; userId?: string };
  org: { id: string; name: string };
  data: T;
  meta: { trace_id: string; env: 'dev' | 'demo' };
}