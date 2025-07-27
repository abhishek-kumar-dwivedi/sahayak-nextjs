
'use server';

import { generateContent, ContentGenerationInput } from '@/ai/flows/content-generation';
import { z } from 'zod';
import { addContentHistory, deleteContentHistory, getContentHistory } from '@/services/firestore';

const ContentFormSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  gradeLevel: z.string({ required_error: 'Please select a grade level.' }),
  subject: z.string({ required_error: 'Please select a subject.' }),
  learningObjective: z.string().min(10, { message: 'Learning objective must be at least 10 characters.' }),
  contentType: z.enum([
      'lesson plan',
      'quiz',
      'worksheet',
      'summary',
      'assignment',
      'sample problems',
    ]),
});

export async function generateContentAction(prevState: any, formData: FormData) {
  const validatedFields = ContentFormSchema.safeParse({
    topic: formData.get('topic'),
    gradeLevel: formData.get('gradeLevel'),
    subject: formData.get('subject'),
    learningObjective: formData.get('learningObjective'),
    contentType: formData.get('contentType'),
  });
  
  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      message: 'Invalid form data.',
      error: firstError || 'Please check your inputs.',
      data: null,
    };
  }

  try {
    const result = await generateContent(validatedFields.data as ContentGenerationInput);
    
    const newContent = {
        createdAt: new Date().toISOString(),
        ...validatedFields.data,
        content: result.content
    };
    
    const newId = await addContentHistory(newContent);

    return {
      message: 'success',
      data: { ...newContent, id: newId },
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate content.',
      error: 'An unexpected error occurred. Please try again.',
      data: null,
    };
  }
}


export async function deleteContentAction(id: string) {
    try {
        await deleteContentHistory(id);
        return { success: true, message: 'Content deleted successfully.' };
    } catch (error) {
        console.error("Failed to delete content:", error);
        return { success: false, message: 'Failed to delete content.' };
    }
}
