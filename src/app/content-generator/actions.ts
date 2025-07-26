'use server';

import { generateContent, ContentGenerationInput } from '@/ai/flows/content-generation';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const contentFilePath = path.join(process.cwd(), 'src/data/generated-content.json');

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

type GeneratedContent = {
  id: string;
  createdAt: string;
  topic: string;
  gradeLevel: string;
  subject: string;
  contentType: string;
  learningObjective: string;
  content: string;
};

async function readContentHistory(): Promise<GeneratedContent[]> {
  try {
    const data = await fs.readFile(contentFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    console.error("Failed to read content history:", error);
    return [];
  }
}

async function writeContentHistory(data: GeneratedContent[]): Promise<void> {
  try {
    await fs.writeFile(contentFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to write content history:", error);
  }
}

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
    
    const newContent: GeneratedContent = {
        id: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        ...validatedFields.data,
        content: result.content
    };
    
    const history = await readContentHistory();
    history.unshift(newContent); // Add to the beginning
    await writeContentHistory(history);

    return {
      message: 'success',
      data: newContent,
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
        const history = await readContentHistory();
        const updatedHistory = history.filter(item => item.id !== id);
        await writeContentHistory(updatedHistory);
        return { success: true, message: 'Content deleted successfully.' };
    } catch (error) {
        console.error("Failed to delete content:", error);
        return { success: false, message: 'Failed to delete content.' };
    }
}
