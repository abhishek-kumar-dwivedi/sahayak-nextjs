
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { summarizeDocumentAction } from '@/app/summarize/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Volume2, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from '@/context/locale-context';

type SummaryData = {
  summary: string;
  audioDataUri?: string;
};

const initialState = {
  message: '',
  data: null as SummaryData | null,
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
          {t('summarizing')}
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          {t('summarizeButton')}
        </>
      )}
    </Button>
  );
}

export default function SummarizePage() {
  const [state, formAction] = useActionState(summarizeDocumentAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const t = useTranslations();

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
    }
  }, [state.message, state.data]);
  
  const playAudio = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => setIsPlaying(false);
    audio?.addEventListener('ended', onEnded);
    return () => audio?.removeEventListener('ended', onEnded);
  }, []);

  return (
    <main className="container mx-auto p-4 animate-fade-in-slow">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold font-headline">{t('summarizerTitle')}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t('summarizerDesc')}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-sm animate-slide-in-from-left">
              <CardHeader>
                <CardTitle>{t('enterDocument')}</CardTitle>
                <CardDescription>{t('enterDocumentDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="documentContent" className="sr-only">Document Content</Label>
                    <Textarea
                      id="documentContent"
                      name="documentContent"
                      placeholder={t('pasteContentPlaceholder')}
                      required
                      className="h-48"
                    />
                  </div>
                  <SubmitButton />
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full min-h-[500px] shadow-sm animate-slide-in-from-right">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{t('generatedSummary')}</CardTitle>
                    <CardDescription>
                      {t('generatedSummaryDesc')}
                    </CardDescription>
                  </div>
                  {state.data?.audioDataUri && (
                    <div className="flex gap-2 -mt-1">
                       <Button variant="outline" size="icon" onClick={playAudio} disabled={!state.data.audioDataUri}>
                         <Volume2 className="h-4 w-4" />
                       </Button>
                       <Button variant="outline" size="icon" asChild>
                         <a href={state.data.audioDataUri} download="summary.wav">
                          <Download className="h-4 w-4" />
                         </a>
                       </Button>
                       <audio ref={audioRef} src={state.data.audioDataUri} className="hidden" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {state.message === 'success' && state.data ? (
                  <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none text-foreground whitespace-pre-wrap leading-relaxed animate-fade-in">
                    {state.data.summary}
                  </div>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center justify-center text-center h-full p-8">
                     <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="font-semibold">{t('summaryDisplayPrompt')}</p>
                    <p className="text-sm">{t('summaryDisplaySubPrompt')}</p>
                  </div>
                )}
                 {state.message === 'error' && (
                  <div className="flex items-center justify-center h-full">
                    <Alert variant="destructive" className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t('summarizationFailed')}</AlertTitle>
                      <AlertDescription>
                        {state.error || 'An unexpected error occurred. Please try again.'}
                      </AlertDescription>
                    </Alert>
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
