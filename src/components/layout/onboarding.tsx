
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, School, Loader2 } from 'lucide-react';
import { useTranslations } from '@/context/locale-context';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGrade } from '@/context/grade-context';
import { useSubject } from '@/context/subject-context';
import { addWorkspace } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';


export function Onboarding() {
  const t = useTranslations();
  const { user } = useAuth();
  const { fetchWorkspaces } = useGrade();
  const { setSelectedSubjectByGrade } = useSubject();
  const { toast } = useToast();

  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
      if (!grade.trim() || !subject.trim()) return;
      
      setIsCreating(true);
      try {
          const newWorkspaceData = {
              grade: grade.trim(),
              subjects: [subject.trim()],
          };
          const newWorkspace = await addWorkspace(newWorkspaceData);
          if (newWorkspace) {
              await fetchWorkspaces();
              setSelectedSubjectByGrade(newWorkspace.grade, newWorkspace.subjects[0]);
          }
      } catch (error) {
          toast({
              variant: 'destructive',
              title: 'Error Creating Workspace',
              description: 'Could not create your workspace. Please try again.'
          });
      } finally {
          setIsCreating(false);
      }
  };
  
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
                    Let's get you set up. Create your first workspace by defining a grade and a subject.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-w-sm mx-auto text-left space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="grade-name">Grade Name</Label>
                        <Input 
                            id="grade-name"
                            placeholder="e.g., 9th Grade, Form 3"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            disabled={isCreating}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subject-name">First Subject Name</Label>
                        <Input 
                            id="subject-name"
                            placeholder="e.g., Mathematics, History"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={isCreating}
                        />
                    </div>
                    <Button 
                        size="lg" 
                        className="w-full"
                        disabled={isCreating || !grade.trim() || !subject.trim()}
                        onClick={handleCreateWorkspace}
                    >
                        {isCreating ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <PlusCircle className="mr-2 h-5 w-5" />
                        )}
                        Create Workspace
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    You can add more grades and subjects later from the sidebar.
                </p>
            </CardContent>
        </Card>
    </div>
  )
}
