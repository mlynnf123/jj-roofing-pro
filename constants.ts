
import { LeadStage } from './types';

export const KANBAN_STAGES: LeadStage[] = [
  LeadStage.NEW_LEAD,
  LeadStage.CONTACTED,
  LeadStage.INSPECTION_SCHEDULED,
  LeadStage.PROPOSAL_SENT,
  LeadStage.CLOSED_WON,
  LeadStage.CLOSED_LOST,
];

export const GEMINI_TEXT_MODEL = "gemini-2.0-flash-exp";

// Note: For the Next.js app, these are now accessed via process.env in the relevant client/server files.
// For example: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
// This file remains for shared constants like KANBAN_STAGES and model names.

// Safely access process.env to ensure compatibility with both Next.js (server/client) and the legacy browser-only environment.
// In the legacy app, `process` is not defined, so these will be `undefined`, gracefully disabling features.
export const GOOGLE_CLIENT_ID = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID : undefined;
export const GOOGLE_API_KEY = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_API_KEY : undefined;
export const GOOGLE_CALENDAR_DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
export const GOOGLE_CALENDAR_SCOPES = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events";