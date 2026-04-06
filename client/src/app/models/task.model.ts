import { User } from './user.model';
import { Event } from './event.model';

export interface Task {
  id?: number;
  description: string;
  status: string;
  assignedStaff?: User;
  event?: Event;
  eventId?: number; 
}