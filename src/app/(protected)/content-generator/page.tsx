
'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { generateContentAction, deleteContentAction } from '@/app/content-generator/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PenSquare, Trash2, CalendarPlus, Wand2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGrade } from '@/context/grade-context';
import { useTranslations } from '@/context/locale-context';
import { useSubject } from '@/context/subject-context';
import { useSearchParams } from 'next/navigation';
import { addEventFromContent } from '@/app/planner/actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getContentHistory } from '@/services/firestore';
import { Skeleton } from '@/components/ui/skeleton';


type GeneratedContent = {
  id: string;
  createdAt: string;
  topic: string;
  gradeLevel: string;
  subject: string;
  contentType: string;
  learningObjective: string;
  content: string;
};

const initialState = {
  message: '',
  data: null as GeneratedContent | null,
  error: null as string | null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('generating')}
        </>
      ) : (
        <>
         <Wand2 className="mr-2 h-4 w-4" />
         {t('generateContent')}
        </>
      )}
    </Button>
  );
}

function AddToPlannerDialog({ contentItem }: { contentItem: GeneratedContent }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [period, setPeriod] = useState<string | undefined>("1");
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const t = useTranslations();
    const totalPeriods = 8;

    const handleAddToPlanner = () => {
        if (!date || !period) {
            toast({ variant: 'destructive', title: 'Please select a date and period.' });
            return;
        }
        startTransition(async () => {
            const result = await addEventFromContent(contentItem, date, parseInt(period));
            if (result.success) {
                toast({ title: 'Success', description: 'Content added to your planner.' });
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-xs">
                    <CalendarPlus className="mr-2 h-3.5 w-3.5" />
                    Schedule
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule Content</DialogTitle>
                    <DialogDescription>Select a date and period to add this content to your planner.</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-center">
                     <Calendar mode="single" selected={date} onSelect={setDate} />
                  </div>
                  <div className="space-y-4">
                      <h4 className="font-medium text-sm">Select a Period</h4>
                      <RadioGroup defaultValue="1" value={period} onValueChange={setPeriod} className="grid grid-cols-2 gap-2">
                          {Array.from({ length: totalPeriods }, (_, i) => i + 1).map((p) => (
                             <div key={p} className="flex items-center space-x-2">
                                <RadioGroupItem value={p.toString()} id={`p-${p}`} />
                                <Label htmlFor={`p-${p}`}>Period {p}</Label>
                              </div>
                          ))}
                      </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddToPlanner} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add to Planner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ContentGeneratorPage() {
  const [state, formAction] = useActionState(generateContentAction, initialState);
  const { toast } = useToast();
  const { selectedGrade } = useGrade();
  const { selectedSubject } = useSubject();
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations();
  
  const searchParams = useSearchParams();
  const topicFromQuery = searchParams.get('topic');

  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  useEffect(() => {
    async function loadHistory() {
        setIsLoadingHistory(true);
        try {
            const historyData = await getContentHistory() as GeneratedContent[];
            setHistory(historyData);
            if(historyData.length > 0) {
                setSelectedContent(historyData[0]);
            }
        } catch(e) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load content history.',
            });
        } finally {
            setIsLoadingHistory(false);
        }
    }
    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: state.error,
      });
    }
  }, [state, toast, t]);
  
  useEffect(() => {
    if (state.message === 'success' && state.data) {
      formRef.current?.reset();
      const newHistory = [state.data, ...history];
      setHistory(newHistory);
      setSelectedContent(state.data);
    }
  }, [state.message, state.data, history]);

  const handleDelete = async (id: string) => {
    const result = await deleteContentAction(id);
    if(result.success) {
        const newHistory = history.filter(item => item.id !== id);
        setHistory(newHistory);
        if (selectedContent?.id === id) {
            setSelectedContent(newHistory.length > 0 ? newHistory[0] : null);
        }
        toast({ description: "Content deleted." });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <main className="container mx-auto p-2 sm:p-4 animate-fade-in-slow">
      <div className="grid gap-4 lg:grid-cols-12 h-full">
          <div className="lg:col-span-4 xl:col-span-3">
              <Card className="h-full flex flex-col shadow-sm">
                 <CardHeader className='p-4'>
                    <CardTitle>{t('generateNewContent')}</CardTitle>
                 </CardHeader>
                 <CardContent className='p-4'>
                    <form ref={formRef} action={formAction} className="space-y-3">
                      <input type="hidden" name="gradeLevel" value={selectedGrade} />
                      <input type="hidden" name="subject" value={selectedSubject} />
                      <div className="space-y-1">
                        <Label htmlFor="topic" className="text-xs">{t('topic')}</Label>
                        <Input id="topic" name="topic" placeholder={t('topicPlaceholder').replace('The Solar System', 'Photosynthesis')} required defaultValue={topicFromQuery || ''} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="contentType" className="text-xs">{t('contentType')}</Label>
                        <Select name="contentType" required>
                          <SelectTrigger id="contentType">
                            <SelectValue placeholder={t('selectContentType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lesson plan">{t('lessonPlan')}</SelectItem>
                            <SelectItem value="quiz">{t('quiz')}</SelectItem>
                            <SelectItem value="worksheet">{t('worksheet')}</SelectItem>
                            <SelectItem value="summary">{t('summary')}</SelectItem>
                            <SelectItem value="assignment">{t('assignment')}</SelectItem>
                            <SelectItem value="sample problems">{t('sampleProblems')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="learningObjective" className="text-xs">{t('learningObjective')}</Label>
                        <Textarea
                          id="learningObjective"
                          name="learningObjective"
                          placeholder={t('learningObjectivePlaceholder')}
                          required
                          className="h-24 text-xs"
                        />
                      </div>
                       <SubmitButton />
                    </form>
                 </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12 lg:col-span-8 h-full">
                <Card className="h-full flex flex-col min-h-[60vh] lg:min-h-0 shadow-sm">
                  <CardHeader className='p-4'>
                    <CardTitle>{selectedContent?.topic || t('generatedContent')}</CardTitle>
                    <CardDescription>
                      {selectedContent?.contentType ? `${t(selectedContent.contentType.replace(/\s+/g, '')) || selectedContent.contentType} for ${t(selectedContent.gradeLevel.replace(/\s+/g, '')) || selectedContent.gradeLevel}` : t('generatedContentDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto p-4">
                    {isLoadingHistory ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : selectedContent ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed animate-fade-in">
                        {selectedContent.content}
                      </div>
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center justify-center text-center h-full p-8">
                        <PenSquare className="w-10 h-10 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold text-sm">{t('contentFormPrompt')}</p>
                        <p className="text-xs">{t('summaryDisplaySubPrompt')}</p>
                      </div>
                    )}
                  </CardContent>
                   {selectedContent && (
                    <CardFooter className="justify-end p-2">
                       <AddToPlannerDialog contentItem={selectedContent} />
                    </CardFooter>
                   )}
                </Card>
            </div>
            <div className="md:col-span-12 lg:col-span-4 h-full">
                 <Card className="h-full flex flex-col min-h-[60vh] lg:min-h-0 shadow-sm">
                    <CardHeader className='p-4'>
                        <CardTitle>{t('contentHistory')}</CardTitle>
                        <CardDescription>{t('contentHistoryDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto space-y-2 p-4">
                        {isLoadingHistory ? (
                             Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-2 rounded-lg border">
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            ))
                        ) : history.length > 0 ? history.map(item => (
                            <div key={item.id} className={`p-2 rounded-lg cursor-pointer border transition-colors ${selectedContent?.id === item.id ? 'bg-muted border-primary/20' : 'hover:bg-muted/50'}`} onClick={() => setSelectedContent(item)}>
                                <h4 className="font-semibold text-xs truncate">{item.topic}</h4>
                                <p className="text-xs text-muted-foreground capitalize">{item.contentType} &bull; {new Date(item.createdAt).toLocaleDateString()}</p>
                                <div className="flex items-center justify-end gap-1 mt-1.5">
                                    <AddToPlannerDialog contentItem={item} />
                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive text-xs" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-muted-foreground flex flex-col items-center justify-center text-center h-full p-4">
                                <BookOpen className="w-8 h-8 text-muted-foreground/50 mb-3" />
                                <p className="font-semibold text-xs">{t('noHistory')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>
      </div>
    </main>
  );
}
