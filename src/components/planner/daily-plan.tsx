
'use client';

import { useState, useMemo, useTransition } from 'react';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/context/locale-context';
import { PlusCircle, Edit, Trash2, Loader2, MoreVertical, BookOpen, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGrade } from '@/context/grade-context';
import { useSubject } from '@/context/subject-context';
import { Textarea } from '@/components/ui/textarea';
import { addEventAction, deleteEventAction } from '@/app/planner/actions';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

type CalendarEvent = {
  id: string; // Firestore IDs are strings
  date: string;
  period: number;
  title: string;
  description: string;
  grade: string;
  subject: string;
};

function AddEventDialog({ date, period, onEventChange }: { date: Date, period: number, onEventChange: () => void }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const t = useTranslations();
    const { selectedGrade } = useGrade();
    const { selectedSubject } = useSubject();

    const handleAddEvent = (formData: FormData) => {
        formData.append('grade', selectedGrade);
        formData.append('subject', selectedSubject);
        formData.append('date', date.toISOString());
        formData.append('period', period.toString());

        startTransition(async () => {
            const result = await addEventAction(formData);
            if (result.success) {
                toast({ title: "Event Added", description: "The new event has been added to your planner." });
                onEventChange();
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.message });
            }
        });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" className="w-full h-full justify-start p-2">
                <PlusCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">{t('addEvent')}</span>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('addEvent')} to Period {period}</DialogTitle>
                <DialogDescription>{t('addEventDesc').replace('{date}', format(date, 'PPP'))}</DialogDescription>
            </DialogHeader>
            <form action={handleAddEvent}>
                <div className="grid gap-3 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="title">{t('title')}</Label>
                        <Input id="title" name="title" required disabled={isPending} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="description">{t('description')}</Label>
                        <Textarea id="description" name="description" disabled={isPending} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isPending}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('saveEvent')}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    )
}

export function DailyPlan({ 
    date: propDate, 
    events, 
    isLoading,
    isDashboard = false, 
    onEventsChange 
}: { 
    date?: Date, 
    events: CalendarEvent[],
    isLoading: boolean,
    isDashboard?: boolean, 
    onEventsChange?: () => void 
}) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();
  const t = useTranslations();
  const { selectedGrade, selectedSubject } = useGrade();
  const totalPeriods = 8;
  const date = propDate || new Date();

  const selectedDayEvents = useMemo(() => {
    if (!date) return [];
    const dayStart = startOfDay(date);
    return events.filter((event) => {
        const eventDate = startOfDay(parseISO(event.date));
        return isSameDay(eventDate, dayStart);
    });
  }, [date, events]);
  
  const eventsByPeriod = useMemo(() => {
      const grouped: { [key: number]: CalendarEvent } = {};
      selectedDayEvents.forEach(event => {
          grouped[event.period] = event;
      });
      return grouped;
  }, [selectedDayEvents]);

  const handleDeleteEvent = (eventId: string) => {
     startDeleteTransition(async () => {
        const result = await deleteEventAction(eventId);
        if (result.success) {
            if(onEventsChange) onEventsChange();
            toast({ title: "Event Deleted", description: "The event has been removed from your planner." });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.message });
        }
    });
  };
  
  if (isDashboard) {
    return (
         <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{t('upcomingLessons')}</CardTitle>
                <CardDescription>
                    {t('upcomingLessonsDesc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                 <div className="space-y-2 h-full">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : selectedDayEvents.length > 0 ? (
                      selectedDayEvents.sort((a, b) => a.period - b.period).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/50 hover:bg-accent/80 transition-colors duration-200">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{event.title}</p>
                            <p className="text-xs text-muted-foreground">Period {event.period}</p>
                          </div>
                          <Link href="/planner" passHref>
                            <Button variant="ghost" size="icon">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-4">
                        <BookOpen className="w-8 h-8 text-muted-foreground/50 mb-3" />
                        <p>{t('noUpcomingLessons')}</p>
                      </div>
                    )}
                </div>
            </CardContent>
             <CardContent className='pt-2'>
                 <Link href="/planner" passHref>
                   <Button className='w-full' variant={'ghost'}>{t('viewPlanner')}</Button>
                 </Link>
             </CardContent>
        </Card>
    )
  }

  return (
    <Card className="shadow-sm animate-slide-in-from-right">
        <CardHeader className='p-4'>
            <CardTitle className="text-lg">
                {date ? format(date, 'PPP') : t('selectDate')}
            </CardTitle>
            <CardDescription>{t('dailyPlan')}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {isLoading ? (
                     Array.from({ length: totalPeriods }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border p-3 min-h-[72px]">
                            <Skeleton className="h-8 w-12" />
                            <div className='flex-1 border-l pl-3 h-full'>
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                        </div>
                     ))
                ) : date && Array.from({ length: totalPeriods }, (_, i) => i + 1).map(period => {
                    const event = eventsByPeriod[period];
                    return (
                       <div key={period} className="flex items-start gap-3 rounded-lg border p-3 bg-card hover:border-primary/20 transition-all duration-300 min-h-[72px] animate-fade-in">
                           <div className="text-xs font-semibold text-muted-foreground w-12 text-center pt-1">
                               <div className="font-bold text-sm text-foreground">P{period}</div>
                           </div>
                           <div className="flex-1 border-l pl-3 h-full">
                            {event ? (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 truncate">{event.description}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem disabled>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteEvent(event.id)} disabled={isDeleting}>
                                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="h-full">
                                    <AddEventDialog date={date} period={period} onEventChange={onEventsChange || (() => {})} />
                                </div>
                            )}
                           </div>
                       </div>
                    )
                })}
                 {!date && (
                     <div className="text-center text-muted-foreground py-10">
                         <p>{t('selectDate')}</p>
                     </div>
                 )}
            </div>
        </CardContent>
     </Card>
  );
}

    