
'use server';

import { z } from 'zod';
import { addContentHistory, deleteContentHistory } from '@/services/firestore';
import { useAuth } from '@/context/auth-context'; // Cannot be used in server component, but this is a server action
import { cookies } from 'next/headers';
import { generateContent } from '@/ai/flows/content-generation';


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
    const { topic, gradeLevel, subject, contentType, learningObjective } = validatedFields.data;
    
    // This is a server action, so we can't use hooks.
    // We'll assume a teacher name for now. A real implementation would get this from the session.
    const teacher = "Sai Pawan"; 

    // Construct URL with query parameters
    const queryParams = new URLSearchParams({
        topic,
        teacher,
        grade: gradeLevel,
        subject,
    });
    
    const apiUrl = `https://8080-firebase-sahayakbackend-1753513521462.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev/generate_content/generate-content/?${queryParams}`;

    // The API expects multipart/form-data, so we send a FormData object, even if empty.
    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        body: new FormData(),
    });

    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error("API Error:", errorText);
        throw new Error(`API request failed with status ${apiResponse.status}: ${errorText}`);
    }

    const result = await apiResponse.json();

    const newContent = {
        createdAt: new Date().toISOString(),
        ...validatedFields.data,
        content: result.response // Assuming the API returns a 'response' field with the content
    };
    
    const newId = await addContentHistory(newContent);

    return {
      message: 'success',
      data: { ...newContent, id: newId },
      error: null,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      message: 'Failed to generate content.',
      error: errorMessage,
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
