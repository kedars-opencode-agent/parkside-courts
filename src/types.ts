export interface Slot {
  courtId: string;
  courtName: string;
  time: string;        // 24h "HH:MM"
  date: string;        // ISO "YYYY-MM-DD"
  available: boolean;
}

export type View = 'home' | 'book';

export interface AppState {
  view: View;
  date: string;
  courtFilter: string; // "any" or a courtId
}
