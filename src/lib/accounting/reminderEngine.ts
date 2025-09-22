import { addDays, differenceInDays, format } from 'date-fns';
import type { Invoice } from './arAging';

export interface ReminderRule {
  id: string;
  name: string;
  triggerDaysAfterDue: number;
  repeatIntervalDays?: number;
  maxReminders?: number;
  template: string;
  isActive: boolean;
}

export interface ReminderLog {
  id: string;
  invoiceId: string;
  ruleId: string;
  sentDate: Date;
  recipientEmail: string;
  subject: string;
  content: string;
  status: 'sent' | 'failed' | 'bounced';
  attempt: number;
}

export interface PendingReminder {
  invoiceId: string;
  ruleId: string;
  scheduledDate: Date;
  recipientEmail: string;
  subject: string;
  content: string;
}

export const DEFAULT_REMINDER_RULES: ReminderRule[] = [
  {
    id: 'gentle-reminder',
    name: 'Gentle Reminder',
    triggerDaysAfterDue: 7,
    template: 'gentle',
    isActive: true
  },
  {
    id: 'follow-up',
    name: 'Follow-up Notice',
    triggerDaysAfterDue: 14,
    template: 'followup',
    isActive: true
  },
  {
    id: 'final-notice',
    name: 'Final Notice',
    triggerDaysAfterDue: 30,
    template: 'final',
    isActive: true
  },
  {
    id: 'weekly-recurring',
    name: 'Weekly Recurring',
    triggerDaysAfterDue: 45,
    repeatIntervalDays: 7,
    maxReminders: 4,
    template: 'recurring',
    isActive: false
  }
];

export const REMINDER_TEMPLATES = {
  gentle: {
    subject: 'Friendly Reminder: Invoice #{invoiceNumber} is Past Due',
    content: `Dear {customerName},

We hope this message finds you well. This is a gentle reminder that Invoice #{invoiceNumber} for {totalAmount} was due on {dueDate} and is now {daysOverdue} days past due.

We understand that delays can happen, and we're here to help if you have any questions about your invoice or need to discuss payment arrangements.

Invoice Details:
- Invoice Number: #{invoiceNumber}
- Amount Due: {totalAmount}
- Due Date: {dueDate}

Please remit payment at your earliest convenience. If you have already sent payment, please disregard this notice.

Thank you for your business.

Best regards,
Team1 Nexus`
  },
  followup: {
    subject: 'Second Notice: Invoice #{invoiceNumber} - Payment Required',
    content: `Dear {customerName},

This is our second notice regarding Invoice #{invoiceNumber} for {totalAmount}, which is now {daysOverdue} days past due.

We have not yet received payment for this invoice, and we wanted to follow up to ensure there are no issues preventing payment.

Invoice Details:
- Invoice Number: #{invoiceNumber}
- Amount Due: {totalAmount}
- Due Date: {dueDate}
- Days Overdue: {daysOverdue}

Please contact us immediately if you have any questions or concerns about this invoice. Otherwise, please remit payment within the next 7 days to avoid any service interruptions.

Thank you for your immediate attention to this matter.

Best regards,
Team1 Nexus Accounts Receivable`
  },
  final: {
    subject: 'FINAL NOTICE: Invoice #{invoiceNumber} - Immediate Action Required',
    content: `Dear {customerName},

This is our FINAL NOTICE regarding Invoice #{invoiceNumber} for {totalAmount}, which is now {daysOverdue} days past due.

Despite our previous reminders, this invoice remains unpaid. If payment is not received within 7 days of this notice, we may be forced to:

1. Suspend services
2. Transfer your account to collections
3. Report the delinquency to credit agencies

Invoice Details:
- Invoice Number: #{invoiceNumber}
- Amount Due: {totalAmount}
- Due Date: {dueDate}
- Days Overdue: {daysOverdue}

Please remit payment immediately or contact us to discuss payment arrangements.

Best regards,
Team1 Nexus Collections Department`
  },
  recurring: {
    subject: 'Weekly Reminder: Invoice #{invoiceNumber} - {daysOverdue} Days Overdue',
    content: `Dear {customerName},

This is your weekly reminder that Invoice #{invoiceNumber} for {totalAmount} remains unpaid and is now {daysOverdue} days past due.

Please contact us immediately to resolve this matter.

Invoice Details:
- Invoice Number: #{invoiceNumber}
- Amount Due: {totalAmount}
- Due Date: {dueDate}
- Days Overdue: {daysOverdue}

Best regards,
Team1 Nexus`
  }
};

export class ReminderEngine {
  private rules: ReminderRule[] = DEFAULT_REMINDER_RULES;
  private reminderLogs: ReminderLog[] = [];

  static calculateDaysOverdue(invoice: Invoice, asOfDate: Date = new Date()): number {
    return Math.max(0, differenceInDays(asOfDate, invoice.dueDate));
  }

  static shouldSendReminder(
    invoice: Invoice,
    rule: ReminderRule,
    existingLogs: ReminderLog[],
    asOfDate: Date = new Date()
  ): boolean {
    // Only send reminders for unpaid invoices
    if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'draft') {
      return false;
    }

    const daysOverdue = this.calculateDaysOverdue(invoice, asOfDate);
    
    // Check if enough days have passed since due date
    if (daysOverdue < rule.triggerDaysAfterDue) {
      return false;
    }

    // Get existing logs for this invoice and rule
    const ruleLogs = existingLogs.filter(log => 
      log.invoiceId === invoice.id && 
      log.ruleId === rule.id &&
      log.status === 'sent'
    );

    // For non-recurring rules, only send once
    if (!rule.repeatIntervalDays) {
      return ruleLogs.length === 0;
    }

    // For recurring rules, check max reminders limit
    if (rule.maxReminders && ruleLogs.length >= rule.maxReminders) {
      return false;
    }

    // For recurring rules, check if enough time has passed since last reminder
    if (ruleLogs.length > 0) {
      const lastReminder = ruleLogs.sort((a, b) => b.sentDate.getTime() - a.sentDate.getTime())[0];
      const daysSinceLastReminder = differenceInDays(asOfDate, lastReminder.sentDate);
      return daysSinceLastReminder >= rule.repeatIntervalDays;
    }

    return true;
  }

  static generateReminderContent(invoice: Invoice, rule: ReminderRule): { subject: string; content: string } {
    const template = REMINDER_TEMPLATES[rule.template as keyof typeof REMINDER_TEMPLATES];
    if (!template) {
      throw new Error(`Template not found: ${rule.template}`);
    }

    const daysOverdue = this.calculateDaysOverdue(invoice);
    const variables = {
      customerName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount.toFixed(2),
      dueDate: format(invoice.dueDate, 'MMM dd, yyyy'),
      daysOverdue: daysOverdue.toString()
    };

    let subject = template.subject;
    let content = template.content;

    // Replace variables in both subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      subject = subject.replace(regex, value);
      content = content.replace(regex, value);
    });

    return { subject, content };
  }

  static getPendingReminders(
    invoices: Invoice[],
    rules: ReminderRule[],
    existingLogs: ReminderLog[],
    asOfDate: Date = new Date()
  ): PendingReminder[] {
    const pending: PendingReminder[] = [];

    for (const invoice of invoices) {
      for (const rule of rules.filter(r => r.isActive)) {
        if (this.shouldSendReminder(invoice, rule, existingLogs, asOfDate)) {
          const { subject, content } = this.generateReminderContent(invoice, rule);
          
          pending.push({
            invoiceId: invoice.id,
            ruleId: rule.id,
            scheduledDate: asOfDate,
            recipientEmail: invoice.customerName, // This should be customer email in real implementation
            subject,
            content
          });
        }
      }
    }

    return pending;
  }

  static logReminder(
    reminder: PendingReminder,
    status: 'sent' | 'failed' | 'bounced',
    existingLogs: ReminderLog[]
  ): ReminderLog {
    const attempt = existingLogs.filter(log => 
      log.invoiceId === reminder.invoiceId && 
      log.ruleId === reminder.ruleId
    ).length + 1;

    return {
      id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceId: reminder.invoiceId,
      ruleId: reminder.ruleId,
      sentDate: new Date(),
      recipientEmail: reminder.recipientEmail,
      subject: reminder.subject,
      content: reminder.content,
      status,
      attempt
    };
  }

  static getReminderHistory(
    invoiceId: string,
    existingLogs: ReminderLog[]
  ): ReminderLog[] {
    return existingLogs
      .filter(log => log.invoiceId === invoiceId)
      .sort((a, b) => b.sentDate.getTime() - a.sentDate.getTime());
  }
}