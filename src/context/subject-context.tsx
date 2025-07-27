
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGrade } from './grade-context';
import { updateWorkspace } from '@/services/firestore';

type SubjectContextType = {
  selectedSubject: string;
  setSelectedSubjectByGrade: (grade: string, subject: string) => void;
  subjectsByGrade: { [key: string]: string[] };
  addSubject: (grade: string, subject: string) => Promise<void>;
  removeSubject: (grade: string, subject: string) => Promise<void>;
};

const lastSelectedGradeKey = 'last_selected_grade_v2';
const lastSelectedSubjectKeyPrefix = 'last_selected_subject_v2_';

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const { selectedGrade, setSelectedGrade, workspaces, isLoading, fetchWorkspaces } = useGrade();
  const [selectedSubject, setSelectedSubjectState] = useState<string>('');

  const subjectsByGrade = workspaces.reduce((acc, ws) => {
    acc[ws.grade] = ws.subjects;
    return acc;
  }, {} as { [key: string]: string[] });

  useEffect(() => {
    if (isLoading || !selectedGrade || !workspaces.length) return;

    try {
        const lastSubjectForGrade = localStorage.getItem(`${lastSelectedSubjectKeyPrefix}${selectedGrade}`);
        const gradeSubjects = subjectsByGrade[selectedGrade] || [];

        if(lastSubjectForGrade && gradeSubjects.includes(lastSubjectForGrade)) {
            setSelectedSubjectState(lastSubjectForGrade);
        } else if (gradeSubjects.length > 0) {
            const firstSubject = gradeSubjects[0];
            setSelectedSubjectState(firstSubject);
            localStorage.setItem(`${lastSelectedSubjectKeyPrefix}${selectedGrade}`, firstSubject);
        } else {
            setSelectedSubjectState('');
        }
    } catch(e) {
        console.error("Could not set subject from local storage", e);
        const gradeSubjects = subjectsByGrade[selectedGrade] || [];
        if (gradeSubjects.length > 0) {
            setSelectedSubjectState(gradeSubjects[0]);
        } else {
            setSelectedSubjectState('');
        }
    }
  }, [selectedGrade, workspaces, isLoading, subjectsByGrade]);


  const addSubject = async (grade: string, subject: string) => {
     const workspaceToUpdate = workspaces.find(ws => ws.grade === grade);
     if (workspaceToUpdate && !workspaceToUpdate.subjects.includes(subject.trim())) {
         const updatedSubjects = [...workspaceToUpdate.subjects, subject.trim()];
         await updateWorkspace(workspaceToUpdate.id, { subjects: updatedSubjects });
         await fetchWorkspaces();
     }
  };

  const removeSubject = async (grade: string, subjectToRemove: string) => {
    const workspaceToUpdate = workspaces.find(ws => ws.grade === grade);
    if (workspaceToUpdate) {
        const updatedSubjects = workspaceToUpdate.subjects.filter(s => s !== subjectToRemove);
        await updateWorkspace(workspaceToUpdate.id, { subjects: updatedSubjects });
        await fetchWorkspaces();

        if (selectedGrade === grade && selectedSubject === subjectToRemove) {
            const newSelectedSubject = updatedSubjects.length > 0 ? updatedSubjects[0] : '';
            setSelectedSubjectState(newSelectedSubject);
            localStorage.setItem(`${lastSelectedSubjectKeyPrefix}${grade}`, newSelectedSubject);
        }
    }
  };

  const setSelectedSubjectByGrade = (grade: string, subject: string) => {
    setSelectedGrade(grade);
    setSelectedSubjectState(subject);
    localStorage.setItem(lastSelectedGradeKey, grade);
    localStorage.setItem(`${lastSelectedSubjectKeyPrefix}${grade}`, subject);
  };
  

  return (
    <SubjectContext.Provider value={{ selectedSubject, setSelectedSubjectByGrade, subjectsByGrade, addSubject, removeSubject }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubject must be used within a SubjectProvider');
  }
  return context;
};
