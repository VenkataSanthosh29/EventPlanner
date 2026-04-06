export interface EventPlannerInfo {
  id?: number;
  username?: string;
}

export interface Event {
  id?: number;
  title: string;
  date: string;          // backend LocalDateTime comes as ISO string
  location: string;
  description: string;
  status: string;
  feedback?: string;
  rating?: number;
  eventType?: string;
  planner?: EventPlannerInfo;
}

