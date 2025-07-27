

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getWorkspaces, addWorkspace, deleteWorkspace } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';

type Workspace = {
    id: string; // Firestore document ID
    grade: string;
    subjects: string[];
};

type GradeContextType = {
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  grades: string[];
  addGrade: (grade: string) => Promise<Workspace | null>;
  removeGrade: (grade: string) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
};

const GradeContext = createContext<GradeContextType | undefined>(undefined);

export const GradeProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([]);
  const [selectedGrade, setSelectedGradeState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkspaces = useCallback(async () => {
      setIsLoading(true);
      try {
        const loadedWorkspaces = await getWorkspaces() as Workspace[];
        setWorkspacesState(loadedWorkspaces);
        
        const lastSelectedGrade = localStorage.getItem('last_selected_grade_v2');
        const availableGrades = loadedWorkspaces.map((ws: Workspace) => ws.grade);

        if (lastSelectedGrade && availableGrades.includes(lastSelectedGrade)) {
            setSelectedGradeState(lastSelectedGrade);
        } else if (availableGrades.length > 0) {
            const firstGrade = availableGrades[0];
            setSelectedGradeState(firstGrade);
            localStorage.setItem('last_selected_grade_v2', firstGrade);
        }
      } catch (e) {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to load workspaces. Please refresh the page.',
          });
      } finally {
        setIsLoading(false);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const setWorkspaces = (newWorkspaces: Workspace[]) => {
    setWorkspacesState(newWorkspaces);
  };
  
  const setSelectedGrade = (grade: string) => {
    setSelectedGradeState(grade);
    localStorage.setItem('last_selected_grade_v2', grade);
  };

  const addGrade = async (grade: string): Promise<Workspace | null> => {
    if (grade.trim() && !workspaces.find(ws => ws.grade === grade.trim())) {
      const newWorkspaceData = { 
          grade: grade.trim(), 
          subjects: [] 
      };
      const newWorkspace = await addWorkspace(newWorkspaceData);
      if (newWorkspace) {
        await fetchWorkspaces(); // Refresh the list from Firestore
        return newWorkspace;
      }
    }
    return null;
  };

  const removeGrade = async (gradeToRemove: string) => {
    const workspaceToRemove = workspaces.find((ws) => ws.grade === gradeToRemove);
    if (!workspaceToRemove) return;

    await deleteWorkspace(workspaceToRemove.id);
    const newWorkspaces = workspaces.filter((ws) => ws.grade !== gradeToRemove);
    setWorkspacesState(newWorkspaces); // Optimistic update

    if (selectedGrade === gradeToRemove) {
      const newSelectedGrade = newWorkspaces.length > 0 ? newWorkspaces[0].grade : '';
      setSelectedGrade(newSelectedGrade);
    }
  };

  return (
    <GradeContext.Provider value={{ 
        selectedGrade, 
        setSelectedGrade, 
        grades: workspaces.map(ws => ws.grade), 
        addGrade, 
        removeGrade,
        workspaces,
        setWorkspaces,
        isLoading,
        fetchWorkspaces
    }}>
      {children}
    </GradeContext.Provider>
  );
};

export const useGrade = () => {
  const context = useContext(GradeContext);
  if (context === undefined) {
    throw new Error('useGrade must be used within a GradeProvider');
  }
  return context;
};
