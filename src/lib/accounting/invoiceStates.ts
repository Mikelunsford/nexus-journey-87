export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'cancelled';

export interface InvoiceStateTransition {
  from: InvoiceStatus;
  to: InvoiceStatus;
  allowedBy: string[];
  requiresData?: string[];
  validation?: (invoice: any, data: any) => boolean;
}

export interface InvoiceState {
  status: InvoiceStatus;
  allowedTransitions: InvoiceStatus[];
  actions: string[];
  isEditable: boolean;
  requiresReminder: boolean;
}

export const INVOICE_STATES: Record<InvoiceStatus, InvoiceState> = {
  draft: {
    status: 'draft',
    allowedTransitions: ['sent', 'cancelled'],
    actions: ['edit', 'send', 'delete'],
    isEditable: true,
    requiresReminder: false
  },
  sent: {
    status: 'sent',
    allowedTransitions: ['viewed', 'overdue', 'paid', 'cancelled'],
    actions: ['view', 'resend', 'markPaid', 'cancel'],
    isEditable: false,
    requiresReminder: true
  },
  viewed: {
    status: 'viewed',
    allowedTransitions: ['overdue', 'paid', 'cancelled'],
    actions: ['view', 'remind', 'markPaid', 'cancel'],
    isEditable: false,
    requiresReminder: true
  },
  overdue: {
    status: 'overdue',
    allowedTransitions: ['paid', 'cancelled'],
    actions: ['view', 'remind', 'markPaid', 'cancel'],
    isEditable: false,
    requiresReminder: true
  },
  paid: {
    status: 'paid',
    allowedTransitions: ['cancelled'],
    actions: ['view', 'refund'],
    isEditable: false,
    requiresReminder: false
  },
  cancelled: {
    status: 'cancelled',
    allowedTransitions: [],
    actions: ['view'],
    isEditable: false,
    requiresReminder: false
  }
};

export const INVOICE_TRANSITIONS: InvoiceStateTransition[] = [
  {
    from: 'draft',
    to: 'sent',
    allowedBy: ['admin', 'manager', 'developer', 'internal'],
    requiresData: ['sentDate', 'recipientEmail'],
    validation: (invoice, data) => !!data.recipientEmail && !!data.sentDate
  },
  {
    from: 'sent',
    to: 'viewed',
    allowedBy: ['system'],
    requiresData: ['viewedDate'],
    validation: (invoice, data) => !!data.viewedDate
  },
  {
    from: 'sent',
    to: 'overdue',
    allowedBy: ['system'],
    requiresData: ['overdueDate'],
    validation: (invoice, data) => {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return today > dueDate;
    }
  },
  {
    from: 'viewed',
    to: 'overdue',
    allowedBy: ['system'],
    requiresData: ['overdueDate'],
    validation: (invoice, data) => {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return today > dueDate;
    }
  },
  {
    from: 'sent',
    to: 'paid',
    allowedBy: ['admin', 'manager', 'developer', 'internal'],
    requiresData: ['paidDate', 'paymentAmount', 'paymentMethod'],
    validation: (invoice, data) => 
      !!data.paidDate && 
      !!data.paymentAmount && 
      data.paymentAmount >= invoice.totalAmount
  },
  {
    from: 'viewed',
    to: 'paid',
    allowedBy: ['admin', 'manager', 'developer', 'internal'],
    requiresData: ['paidDate', 'paymentAmount', 'paymentMethod'],
    validation: (invoice, data) => 
      !!data.paidDate && 
      !!data.paymentAmount && 
      data.paymentAmount >= invoice.totalAmount
  },
  {
    from: 'overdue',
    to: 'paid',
    allowedBy: ['admin', 'manager', 'developer', 'internal'],
    requiresData: ['paidDate', 'paymentAmount', 'paymentMethod'],
    validation: (invoice, data) => 
      !!data.paidDate && 
      !!data.paymentAmount && 
      data.paymentAmount >= invoice.totalAmount
  }
];

export class InvoiceStateMachine {
  static canTransition(from: InvoiceStatus, to: InvoiceStatus, userRole: string): boolean {
    const transition = INVOICE_TRANSITIONS.find(t => t.from === from && t.to === to);
    if (!transition) return false;
    
    return transition.allowedBy.includes(userRole) || transition.allowedBy.includes('system');
  }

  static getValidTransitions(currentStatus: InvoiceStatus): InvoiceStatus[] {
    return INVOICE_STATES[currentStatus]?.allowedTransitions || [];
  }

  static getAvailableActions(currentStatus: InvoiceStatus): string[] {
    return INVOICE_STATES[currentStatus]?.actions || [];
  }

  static isEditable(currentStatus: InvoiceStatus): boolean {
    return INVOICE_STATES[currentStatus]?.isEditable || false;
  }

  static requiresReminder(currentStatus: InvoiceStatus): boolean {
    return INVOICE_STATES[currentStatus]?.requiresReminder || false;
  }

  static validateTransition(
    from: InvoiceStatus, 
    to: InvoiceStatus, 
    invoice: any, 
    data: any, 
    userRole: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.canTransition(from, to, userRole)) {
      errors.push(`Transition from ${from} to ${to} not allowed for role ${userRole}`);
    }
    
    const transition = INVOICE_TRANSITIONS.find(t => t.from === from && t.to === to);
    if (transition) {
      // Check required data
      if (transition.requiresData) {
        for (const field of transition.requiresData) {
          if (!data[field]) {
            errors.push(`Required field missing: ${field}`);
          }
        }
      }
      
      // Run custom validation
      if (transition.validation && !transition.validation(invoice, data)) {
        errors.push(`Transition validation failed for ${from} -> ${to}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}