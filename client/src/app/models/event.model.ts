// export interface Event {
//   id?: number;
//   title: string;
//   date: string;          // ISO date string from backend
//   location: string;
//   description: string;
//   status: string;
//   feedback?: string;
//   eventType?: string;
// }


export interface Event {
  id?: number;
  title: string;
  date: string;
  location: string;
  description: string;
  status: string;
  feedback?: string;

  // ✅ NEW
  rating?: number;
  eventType?: string; // if you already added
}

