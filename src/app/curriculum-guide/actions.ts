
'use server';

import { curriculumSuggestion, CurriculumSuggestionInput, CurriculumSuggestionOutput } from '@/ai/flows/curriculum-suggestion';
import { z } from 'zod';
import mockCurriculum from '@/data/mock-curriculum.json';

const CurriculumFormSchema = z.object({
  topic: z.string().optional(),
  gradeLevel: z.string({ required_error: 'Please select a grade level.' }),
  subject: z.string({ required_error: 'Please select a subject.' }),
  curriculumPdf: z.instanceof(File).optional(),
});


// A simple delay function to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateCurriculumAction(prevState: any, formData: FormData) {
  const validatedFields = CurriculumFormSchema.safeParse({
    topic: formData.get('topic'),
    gradeLevel: formData.get('gradeLevel'),
    subject: formData.get('subject'),
    curriculumPdf: formData.get('curriculumPdf') as File,
  });

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      message: 'Invalid form data.',
      error: firstError || 'Please check your inputs.',
      data: null,
    };
  }
  
  const { topic, gradeLevel, subject } = validatedFields.data;
  const curriculumPdf = formData.get('curriculumPdf') as File;
  const hasPdf = curriculumPdf instanceof File && curriculumPdf.size > 0;

  if (!topic && !hasPdf) {
     return {
      message: 'Invalid form data.',
      error: 'Please provide a topic or upload a PDF.',
      data: null,
    };
  }
  
  try {
    if (hasPdf) {
      await delay(1500); 
      return {
          message: 'success',
          data: mockCurriculum as CurriculumSuggestionOutput,
          error: null,
      }
    }

    const result = await curriculumSuggestion({
      gradeLevel,
      subject,
      topic,
    });

    return {
      message: 'success',
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate curriculum.',
      error: 'An unexpected error occurred. Please try again.',
      data: null,
    };
  }
}
