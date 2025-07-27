// src/app/(protected)/dashboard/page.tsx
import { getProgressData, getEvents } from '@/services/firestore';
import { DashboardClient } from './dashboard-client';

export const revalidate = 0; // Ensures fresh data on each request

type Progress = {
    month: string;
    progress: number;
    grade: string;
    subject: string;
}

type CalendarEvent = {
  id: string; 
  date: string;
  period: number;
  title: string;
  description: string;
  grade: string;
  subject: string;
};

export default async function DashboardPage() {
  let initialProgress: Progress[] = [];
  let initialEvents: CalendarEvent[] = [];
  let initialError: string | null = null;

  try {
    // Fetch data in parallel
    const [progress, eventsData] = await Promise.all([
        getProgressData(),
        getEvents()
    ]);
    initialProgress = progress as Progress[];
    initialEvents = eventsData as CalendarEvent[];
  } catch (e) {
      console.error("Failed to load dashboard data:", e);
      initialError = "Failed to load dashboard data. Please try again later.";
  }

  return (
      <DashboardClient 
          initialProgress={initialProgress} 
          initialEvents={initialEvents}
          initialError={initialError}
      />
  );
}
