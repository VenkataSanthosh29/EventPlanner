export interface EventRequest {
  id?: number;

  clientId: number;
  clientName: string;

  plannerId: number;
  plannerName: string;

  eventType: string;
  preferredDate?: string;
  location?: string;
  description?: string;


  status: 'PENDING' | 'BUDGET_PROPOSED' | 'AGREED' | 'REJECTED';

  // Budget flow:
  budgetStatus?: 'PENDING' | 'BUDGET_PROPOSED' | 'CLIENT_ACCEPTED' | 'CLIENT_REJECTED';
  budgetProposed?: number;  // rupees
  finalBudget?: number;     // rupees

  createdEventId?: number;
  paymentId?: number;
}