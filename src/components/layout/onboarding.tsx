
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, School } from 'lucide-react';
import { ManageGradesDialog } from './app-sidebar';
import { useTranslations } from '@/context/locale-context';
import { useAuth } from '@/context/auth-context';

export function Onboarding() {
  const t = useTranslations();
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4 animate-fade-in">
        <Card className="max-w-xl w-full text-center shadow-lg animate-slide-in-from-bottom">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <School className="h-10 w-10" />
                </div>
                <CardTitle className="text-3xl">
                    Welcome to TutorAlly, {user?.displayName || 'Teacher'}!
                </CardTitle>
                <CardDescription className="text-base max-w-md mx-auto pt-2">
                    Your new AI-powered teaching companion is ready. Let's start by creating your first workspace (e.g., "9th Grade").
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ManageGradesDialog>
                     <Button size="lg">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Your First Workspace
                    </Button>
                </ManageGradesDialog>
                <p className="text-xs text-muted-foreground mt-4">
                    Workspaces help you organize content for different grades or classes.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
