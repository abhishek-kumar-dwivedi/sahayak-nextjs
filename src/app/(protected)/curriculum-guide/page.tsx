
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateCurriculumAction } from '@/app/curriculum-guide/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BookCopy, UploadCloud, Wand2 } from 'lucide-react';
import { useGrade } from '@/context/grade-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/context/locale-context';
import { useSubject } from '@/context/subject-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

type SubTopic = {
  title: string;
  description: string;
};

type Chapter = {
  title: string;
  subTopics: SubTopic[];
};

type CurriculumData = {
  chapters: Chapter[];
};


const initialState = {
  message: '',
  data: null as CurriculumData | null,
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
        t('generateCurriculum')
      )}
    </Button>
  );
}

export default function CurriculumGuidePage() {
  const [state, formAction] = useActionState(generateCurriculumAction, initialState);
  const { selectedGrade } = useGrade();
  const { selectedSubject } = useSubject();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const t = useTranslations();
  const selectedGradeText = t(selectedGrade) || selectedGrade;

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
    if (state.message === 'success') {
      formRef.current?.reset();
      setFileName('');
    }
  }, [state.message]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <main className="container mx-auto p-4 animate-fade-in-slow">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold font-headline">{t('aiCurriculumGuide')}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t('aiCurriculumGuideDesc').replace('{grade}', selectedGradeText)}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-sm animate-slide-in-from-left">
              <CardHeader>
                <CardTitle>{t('defineCurriculum')}</CardTitle>
                <CardDescription>{t('defineCurriculumDesc').replace('{grade}', selectedGradeText)}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="topic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="topic">{t('topic')}</TabsTrigger>
                    <TabsTrigger value="pdf">PDF</TabsTrigger>
                  </TabsList>
                  <form ref={formRef} action={formAction} className="space-y-4 mt-4">
                    <input type="hidden" name="gradeLevel" value={selectedGrade} />
                    <input type="hidden" name="subject" value={selectedSubject} />
                    <TabsContent value="topic">
                        <div className="space-y-1.5">
                          <Label htmlFor="topic">{t('topic')}</Label>
                          <Input id="topic" name="topic" placeholder={t('topicPlaceholder')} />
                        </div>
                    </TabsContent>
                    <TabsContent value="pdf">
                      <div className="space-y-1.5">
                        <Label htmlFor="file-upload">{t('uploadPdf')}</Label>
                        <Label
                          htmlFor="file-upload"
                          className="group cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors duration-300"
                        >
                          <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            {fileName || t('selectPdf')}
                          </p>
                        </Label>
                        <Input id="file-upload" name="curriculumPdf" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" />
                      </div>
                    </TabsContent>
                    <SubmitButton />
                  </form>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full min-h-[500px] shadow-sm animate-slide-in-from-right">
              <CardHeader>
                <CardTitle>{t('generatedCurriculum')}</CardTitle>
                <CardDescription>{t('generatedCurriculumDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {state.data?.chapters ? (
                  <Accordion type="single" collapsible className="w-full animate-fade-in">
                    {state.data.chapters.map((chapter, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{chapter.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {chapter.subTopics.map((subTopic, subIndex) => (
                              <div key={subIndex} className="p-3 rounded-md bg-muted/50">
                                <h4 className="font-semibold">{subTopic.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1 mb-2.5">{subTopic.description}</p>
                                <Link href={`/content-generator?topic=${encodeURIComponent(subTopic.title)}`} passHref>
                                  <Button size="sm" variant="outline">
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    {t('generateContent')}
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center justify-center text-center h-full p-8">
                    <BookCopy className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="font-semibold">{t('formPrompt')}</p>
                    <p className="text-sm">{t('summaryDisplaySubPrompt')}</p>
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
