

'use client';

import { useState, useMemo } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useTranslations } from '@/context/locale-context';
import initialEvents from '@/data/events.json';
import { useGrade } from '@/context/grade-context';
import { useSubject } from '@/context/subject-context';
import { DailyPlan } from '@/components/planner/daily-plan';

type CalendarEvent = {
  id: number;
  date: string;
  period: number;
  title: string;
  description: string;
  grade: string;
  subject: string;
};

export default function PlannerPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const t = useTranslations();
  const { selectedGrade } = useGrade();
  const { selectedSubject } = useSubject();
  
  const filteredEvents = useMemo(() => {
    return initialEvents.filter(e => e.grade === selectedGrade && e.subject === selectedSubject);
  }, [selectedGrade, selectedSubject]);

  return (
    <main className="container mx-auto p-4 animate-fade-in-slow">
       <header className="text-center mb-6">
          <h1 className="text-3xl font-bold font-headline">{t('planner')}</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-2xl mx-auto">
            {t('plannerDesc')}
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-12 lg:col-span-8 xl:col-span-9">
            <DailyPlan date={date} />
          </div>
          <div className="md:col-span-12 lg:col-span-4 xl:col-span-3">
            <Card className="sticky top-20 shadow-sm p-0 animate-slide-in-from-left">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3 w-full"
                    classNames={{
                        months: "w-full",
                        month: "w-full",
                        table: "w-full",
                        head_row: "w-full justify-between",
                        row: "w-full justify-between",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                        day_today: "bg-accent text-accent-foreground",
                    }}
                    components={{
                        DayContent: ({ date, ...props }) => {
                          const hasEvent = filteredEvents.some(event => isSameDay(parseISO(event.date), date));
                          return (
                            <div className="relative h-full w-full flex items-center justify-center">
                              <span>{date.getDate()}</span>
                              {hasEvent && (
                                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </div>
                          );
                        },
                      }}
                    />
            </Card>
          </div>
        </div>
    </main>
  );
}
