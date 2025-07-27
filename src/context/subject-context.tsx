
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGrade } from './grade-context';

type SubjectContextType = {
  selectedSubject: string;
  setSelectedSubjectByGrade: (grade: string, subject: string) => void;
  subjectsByGrade: { [key: string]: string[] };
  addSubject: (grade: string, subject: string) => void;
  removeSubject: (grade: string, subject: string) => void;
};

const lastSelectedGradeKey = 'last_selected_grade_v2';
const lastSelectedSubjectKeyPrefix = 'last_selected_subject_v2_';

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const { selectedGrade, setSelectedGrade, workspaces, setWorkspaces, isLoading } = useGrade();
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
            setSelectedSubjectState(gradeSubjects[0]);
        } else {
            setSelectedSubjectState('');
        }
    } catch(e) {
        console.error("Could not set subject from local storage", e);
        const gradeSubjects = subjectsByGrade[selectedGrade] || [];
        setSelectedSubjectState(gradeSubjects[0] || '');
    }
  }, [selectedGrade, workspaces, isLoading]);


  const addSubject = (grade: string, subject: string) => {
     const newWorkspaces = workspaces.map(ws => {
        if (ws.grade === grade) {
            if (!ws.subjects.includes(subject.trim())) {
                return { ...ws, subjects: [...ws.subjects, subject.trim()] };
            }
        }
        return ws;
    });
    setWorkspaces(newWorkspaces);
  };

  const removeSubject = (grade: string, subjectToRemove: string) => {
    const newWorkspaces = workspaces.map(ws => {
        if (ws.grade === grade) {
            const newSubjects = ws.subjects.filter(s => s !== subjectToRemove);
            if (selectedGrade === grade && selectedSubject === subjectToRemove) {
                const newSelectedSubject = newSubjects.length > 0 ? newSubjects[0] : '';
                setSelectedSubjectState(newSelectedSubject);
                localStorage.setItem(`${lastSelectedSubjectKeyPrefix}${grade}`, newSelectedSubject);
            }
            return { ...ws, subjects: newSubjects };
        }
        return ws;
    });
    setWorkspaces(newWorkspaces);
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
