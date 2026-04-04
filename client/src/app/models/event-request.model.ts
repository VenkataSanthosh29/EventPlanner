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

  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdEventId?: number;
}