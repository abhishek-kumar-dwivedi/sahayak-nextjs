
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, School, Loader2 } from 'lucide-react';
import { useTranslations } from '@/context/locale-context';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGrade } from '@/context/grade-context';
import { useSubject } from '@/context/subject-context';
import type { Workspace } from '@/context/grade-context';

function OnboardingDialog({ children }: { children: React.ReactNode }) {
  const { addGrade, fetchWorkspaces } = useGrade();
  const { addSubject, setSelectedSubjectByGrade } = useSubject();
  const [step, setStep] = useState(1);
  const [newGrade, setNewGrade] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [createdWorkspace, setCreatedWorkspace] = useState<Workspace | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const handleCreateGrade = async () => {
    if (newGrade.trim()) {
      setIsCreating(true);
      const workspace = await addGrade(newGrade.trim());
      if (workspace) {
        setCreatedWorkspace(workspace);
        setStep(2);
      }
      setIsCreating(false);
    }
  };

  const handleCreateSubject = async () => {
    if (newSubject.trim() && createdWorkspace) {
      setIsCreating(true);
      await addSubject(createdWorkspace.grade, newSubject.trim());
      // Re-fetch workspaces to update the global state and trigger the layout change
      await fetchWorkspaces(); 
      // Auto-select the new workspace
      setSelectedSubjectByGrade(createdWorkspace.grade, newSubject.trim());
      setIsCreating(false);
      setOpen(false); // Close the dialog
    }
  };

  const resetState = () => {
    setStep(1);
    setNewGrade('');
    setNewSubject('');
    setCreatedWorkspace(null);
    setIsCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetState();
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onInteractOutside={e => e.preventDefault()} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Create Your First Workspace' : `Add a Subject to ${createdWorkspace?.grade}`}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Workspaces help you organize content. Let's start with a grade name." 
              : "Great! Now, let's add the first subject you'll be teaching for this grade."}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
            <div className="space-y-2 py-4">
              <Label htmlFor="new-grade">Grade Name</Label>
              <Input
                id="new-grade"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                placeholder="e.g., 9th Grade, Form 3"
              />
            </div>
        )}

        {step === 2 && (
            <div className="space-y-2 py-4 animate-fade-in">
              <Label htmlFor="new-subject">Subject Name</Label>
              <Input
                id="new-subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g., Mathematics, History"
              />
            </div>
        )}
        
        <DialogFooter>
           {step === 1 && (
                <Button onClick={handleCreateGrade} disabled={isCreating || !newGrade.trim()}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                </Button>
           )}
            {step === 2 && (
                <Button onClick={handleCreateSubject} disabled={isCreating || !newSubject.trim()}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Finish Setup
                </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
                    Welcome to Sahayak, {user?.displayName || 'Teacher'}!
                </CardTitle>
                <CardDescription className="text-base max-w-md mx-auto pt-2">
                    Your new AI-powered teaching companion is ready. Let's start by creating your first workspace (e.g., "9th Grade").
                </CardDescription>
            </CardHeader>
            <CardContent>
                <OnboardingDialog>
                     <Button size="lg">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Your First Workspace
                    </Button>
                </OnboardingDialog>
                <p className="text-xs text-muted-foreground mt-4">
                    Workspaces help you organize content for different grades or classes.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
