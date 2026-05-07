import type { Slot } from './types';

const TODAY = new Date().toISOString().slice(0, 10);

export const SCHEDULE: Slot[] = [
  { courtId: 'court-1', courtName: 'Court 1', time: '18:00', date: TODAY, available: true },
  { courtId: 'court-1', courtName: 'Court 1', time: '18:30', date: TODAY, available: true },
  { courtId: 'court-1', courtName: 'Court 1', time: '19:00', date: TODAY, available: true },
  { courtId: 'court-2', courtName: 'Court 2', time: '18:00', date: TODAY, available: true },
  { courtId: 'court-2', courtName: 'Court 2', time: '18:30', date: TODAY, available: true },
  { courtId: 'court-3', courtName: 'Court 3', time: '18:30', date: TODAY, available: true },
  { courtId: 'court-3', courtName: 'Court 3', time: '19:00', date: TODAY, available: true },
  { courtId: 'court-3', courtName: 'Court 3', time: '19:30', date: TODAY, available: true },
];

export const COURTS = [
  { id: 'court-1', name: 'Court 1' },
  { id: 'court-2', name: 'Court 2' },
  { id: 'court-3', name: 'Court 3' },
];
