import type { Slot } from './types';

export const COURTS = [
  { id: 'court-1', name: 'Court 1' },
  { id: 'court-2', name: 'Court 2' },
  { id: 'court-3', name: 'Court 3' },
];

const TIMES = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
const DAYS_AHEAD = 14;

function isoForOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const TODAY = isoForOffset(0);

// Today's slots are pinned: the original 8 hand-curated by the club.
const todaySlots: Slot[] = [
  { courtId: 'court-1', courtName: 'Court 1', time: '18:00', date: TODAY, available: true },
  { courtId: 'court-1', courtName: 'Court 1', time: '18:30', date: TODAY, available: true },
  { courtId: 'court-1', courtName: 'Court 1', time: '19:00', date: TODAY, available: true },
  { courtId: 'court-2', courtName: 'Court 2', time: '18:00', date: TODAY, available: true },
  { courtId: 'court-2', courtName: 'Court 2', time: '18:30', date: TODAY, available: true },
  { courtId: 'court-3', courtName: 'Court 3', time: '18:30', date: TODAY, available: true },
  { courtId: 'court-3', courtName: 'Court 3', time: '19:00', date: TODAY, available: true },
  { courtId: 'court-3', courtName: 'Court 3', time: '19:30', date: TODAY, available: true },
];

// Deterministic pseudo-random availability for future days so the demo is reproducible.
function isOpen(date: string, courtId: string, time: string): boolean {
  let h = 0;
  const key = date + courtId + time;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % 10 < 7; // ~70% open
}

const futureSlots: Slot[] = [];
for (let offset = 1; offset <= DAYS_AHEAD; offset++) {
  const date = isoForOffset(offset);
  for (const court of COURTS) {
    for (const time of TIMES) {
      if (!isOpen(date, court.id, time)) continue;
      futureSlots.push({
        courtId: court.id,
        courtName: court.name,
        time,
        date,
        available: true,
      });
    }
  }
}

export const SCHEDULE: Slot[] = [...todaySlots, ...futureSlots];
