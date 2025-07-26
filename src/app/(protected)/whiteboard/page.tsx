
'use client';

import { Whiteboard } from '@/components/whiteboard';
import { useTranslations } from '@/context/locale-context';

export default function WhiteboardPage() {
  const t = useTranslations();
  return (
    <div className="flex flex-col h-full w-full p-4 md:p-6 gap-4 animate-fade-in-slow">
       <header className="text-center">
          <h1 className="text-3xl font-bold font-headline">{t('whiteboardTitle')}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-sm">
            {t('whiteboardDesc')}
          </p>
        </header>
      <div className="flex-grow rounded-lg overflow-hidden shadow-sm border">
        <Whiteboard />
      </div>
    </div>
  );
}
