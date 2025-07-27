
'use server';

import { curriculumSuggestion, CurriculumSuggestionInput, CurriculumSuggestionOutput } from '@/ai/flows/curriculum-suggestion';
import { z } from 'zod';

const CurriculumFormSchema = z.object({
  topic: z.string().optional(),
  gradeLevel: z.string({ required_error: 'Please select a grade level.' }),
  subject: z.string({ required_error: 'Please select a subject.' }),
  curriculumPdf: z.instanceof(File).optional(),
});


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
    // PDF processing is currently mocked and returns a static JSON structure.
    // In a real application, you would parse the PDF and generate the curriculum.
    if (hasPdf) {
      // This is where you would call a flow to process the PDF content
      // For now, we return a mock curriculum.
      // In a real scenario, you'd extract text from the PDF and pass it to curriculumSuggestion.
      const mockData = {
          "chapters": [
              {
                  "title": "Chapter 1: The Foundations of the Solar System (from PDF)",
                  "subTopics": [
                      {
                          "title": "Introduction to Stars and Planets",
                          "description": "Understanding the basic components of our cosmic neighborhood and the forces that govern them."
                      },
                      {
                          "title": "The Birth of the Sun",
                          "description": "Exploring the nebular hypothesis and the formation of our solar system's central star."
                      }
                  ]
              }
          ]
      };
      return {
          message: 'success',
          data: mockData as CurriculumSuggestionOutput,
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
