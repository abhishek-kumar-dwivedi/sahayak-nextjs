// src/app/(protected)/dashboard/dashboard-client.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowRight, BookCopy, PenSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useGrade } from '@/context/grade-context';
import { useTranslations } from '@/context/locale-context';
import { useSubject } from '@/context/subject-context';
import { DailyPlan } from '@/components/planner/daily-plan';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyStateIllustration } from '@/components/illustrations/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const chartConfig = {
  progress: {
    label: 'Progress',
    color: 'hsl(var(--primary))',
  },
};

function GradeDashboardClient({ 
    grade, 
    subject, 
    progressData, 
    events, 
    isLoading,
    error 
}: { 
    grade: string; 
    subject: string; 
    progressData: Progress[];
    events: CalendarEvent[];
    isLoading: boolean;
    error: string | null;
}) {
  const t = useTranslations();
  
  if (error) {
      return (
         <Card className="lg:col-span-3">
             <CardHeader/>
             <CardContent className="flex flex-col items-center justify-center text-center h-80 text-muted-foreground p-4">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Dashboard</AlertTitle>
                    <AlertDescription>
                     {error}
                    </AlertDescription>
                </Alert>
            </CardContent>
         </Card>
      )
  }

  return (
    <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2 overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>{t('studentProgress')}</CardTitle>
          <CardDescription>
            {t('studentProgressDesc', { grade: grade })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : progressData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
             <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground p-4">
                <EmptyStateIllustration className="w-48 h-32 mb-4" />
                <p>No progress data available for this workspace.</p>
              </div>
          )}
        </CardContent>
      </Card>
      <div className='lg:col-span-1'>
        <DailyPlan 
            isDashboard={true} 
            events={events}
            isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export function DashboardClient({ 
    initialProgress, 
    initialEvents,
    initialError 
}: { 
    initialProgress: Progress[]; 
    initialEvents: CalendarEvent[];
    initialError: string | null;
}) {
  const { selectedGrade } = useGrade();
  const { selectedSubject } = useSubject();
  const t = useTranslations();
  const { user } = useAuth();
  
  const filteredProgress = initialProgress.filter(p => p.grade === selectedGrade && p.subject === selectedSubject);
  const filteredEvents = initialEvents.filter(e => e.grade === selectedGrade && e.subject === selectedSubject);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">
             Welcome, {user?.displayName || 'Teacher'}!
          </h1>
          <p className="text-muted-foreground font-body">{t('welcomeBack')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="hover:shadow-md transition-shadow duration-300 group">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{t('generateNewContent')}</CardTitle>
                    <CardDescription>{t('quickActionsDesc', { grade: selectedGrade })}</CardDescription>
                </div>
                <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:scale-105 transition-transform">
                    <PenSquare className="w-5 h-5" />
                </div>
            </CardHeader>
            <CardContent>
                 <Link href="/content-generator" passHref>
                    <Button className="w-full">{t('generateNewContent')} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
            </CardContent>
         </Card>
         <Card className="hover:shadow-md transition-shadow duration-300 group">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{t('exploreCurriculums')}</CardTitle>
                    <CardDescription>{t('quickActionsDesc', { grade: selectedGrade })}</CardDescription>
                </div>
                <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:scale-105 transition-transform">
                    <BookCopy className="w-5 h-5" />
                </div>
            </CardHeader>
            <CardContent>
                <Link href="/curriculum-guide" passHref>
                    <Button className="w-full" variant="secondary">{t('exploreCurriculums')} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
            </CardContent>
         </Card>
      </div>

      <GradeDashboardClient 
          grade={selectedGrade} 
          subject={selectedSubject} 
          progressData={filteredProgress}
          events={filteredEvents}
          isLoading={false} // Data is pre-loaded by server component
          error={initialError}
      />

    </div>
  );
}
