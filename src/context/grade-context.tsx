
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getWorkspaces, updateWorkspaces } from '@/services/firestore';

type Workspace = {
    id: string; // Firestore document ID
    grade: string;
    subjects: string[];
};

type GradeContextType = {
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  grades: string[];
  addGrade: (grade: string) => void;
  removeGrade: (grade: string) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  isLoading: boolean;
};

const GradeContext = createContext<GradeContextType | undefined>(undefined);

export const GradeProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([]);
  const [selectedGrade, setSelectedGradeState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        
        const loadedWorkspaces = await getWorkspaces() as Workspace[];
        setWorkspacesState(loadedWorkspaces);
        
        const lastSelectedGrade = localStorage.getItem('last_selected_grade_v2');
        const availableGrades = loadedWorkspaces.map((ws: Workspace) => ws.grade);

        if (lastSelectedGrade && availableGrades.includes(lastSelectedGrade)) {
            setSelectedGradeState(lastSelectedGrade);
        } else if (availableGrades.length > 0) {
            setSelectedGradeState(availableGrades[0]);
        }
        setIsLoading(false);
    }
    loadData();
  }, []);

  const setWorkspaces = async (newWorkspaces: Workspace[]) => {
    setWorkspacesState(newWorkspaces);
    await updateWorkspaces(newWorkspaces);
  };
  
  const setSelectedGrade = (grade: string) => {
    setSelectedGradeState(grade);
    localStorage.setItem('last_selected_grade_v2', grade);
  };

  const addGrade = (grade: string) => {
    if (grade.trim() && !workspaces.find(ws => ws.grade === grade.trim())) {
      const newWorkspace = { 
          id: grade.trim().replace(/\s+/g, '_'), 
          grade: grade.trim(), 
          subjects: [] 
      };
      const newWorkspaces = [...workspaces, newWorkspace];
      setWorkspaces(newWorkspaces);
    }
  };

  const removeGrade = (gradeToRemove: string) => {
    const newWorkspaces = workspaces.filter((ws) => ws.grade !== gradeToRemove);
    setWorkspaces(newWorkspaces);

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
        isLoading
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
