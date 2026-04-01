export interface Event {
  id?: number;
  title: string;
  date: string;          // ISO date string from backend
  location: string;
  description: string;
  status: string;
  feedback?: string;
}

