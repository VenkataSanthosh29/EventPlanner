import { User } from './user.model';

export interface Task {
  id?: number;
  description: string;
  status: string;
  assignedStaff?: User;
}
