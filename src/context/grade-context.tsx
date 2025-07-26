'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import initialWorkspaces from '@/data/workspaces.json';

const gradesStorageKey = 'grades_v2';
const subjectsStorageKeyPrefix = 'subjects_v3_';

type Workspace = {
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
};

const GradeContext = createContext<GradeContextType | undefined>(undefined);

export const GradeProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([]);
  const [selectedGrade, setSelectedGradeState] = useState<string>('');

  useEffect(() => {
    try {
      const storedWorkspaces = localStorage.getItem(gradesStorageKey);
      const loadedWorkspaces = storedWorkspaces ? JSON.parse(storedWorkspaces) : initialWorkspaces;
      setWorkspacesState(loadedWorkspaces);
      
      const lastSelectedGrade = localStorage.getItem('last_selected_grade_v2');
      const availableGrades = loadedWorkspaces.map((ws: Workspace) => ws.grade);

      if (lastSelectedGrade && availableGrades.includes(lastSelectedGrade)) {
        setSelectedGradeState(lastSelectedGrade);
      } else if (availableGrades.length > 0) {
        setSelectedGradeState(availableGrades[0]);
      }
    } catch (error) {
      console.error("Failed to load workspaces from localStorage", error);
      setWorkspacesState(initialWorkspaces);
      if(initialWorkspaces.length > 0) {
          setSelectedGradeState(initialWorkspaces[0].grade);
      }
    }
  }, []);

  const setWorkspaces = (newWorkspaces: Workspace[]) => {
    setWorkspacesState(newWorkspaces);
    localStorage.setItem(gradesStorageKey, JSON.stringify(newWorkspaces));
  };
  
  const setSelectedGrade = (grade: string) => {
    setSelectedGradeState(grade);
    localStorage.setItem('last_selected_grade_v2', grade);
  };

  const addGrade = (grade: string) => {
    if (grade.trim() && !workspaces.find(ws => ws.grade === grade.trim())) {
      const newWorkspaces = [...workspaces, { grade: grade.trim(), subjects: [] }];
      setWorkspaces(newWorkspaces);
    }
  };

  const removeGrade = (gradeToRemove: string) => {
    const newWorkspaces = workspaces.filter((ws) => ws.grade !== gradeToRemove);
    setWorkspaces(newWorkspaces);
    localStorage.removeItem(`${subjectsStorageKeyPrefix}${gradeToRemove.replace(/\s+/g, '_')}`);

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
        setWorkspaces
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
