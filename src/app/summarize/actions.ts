'use server';

import { summarizeDocument, SummarizeDocumentInput } from '@/ai/flows/summarize-documents';
import { z } from 'zod';

const SummarizeFormSchema = z.object({
  documentContent: z.string().min(20, { message: 'Document content must be at least 20 characters.' }),
});

export async function summarizeDocumentAction(prevState: any, formData: FormData) {
  const validatedFields = SummarizeFormSchema.safeParse({
    documentContent: formData.get('documentContent'),
  });
  
  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      message: 'error',
      error: firstError || 'Please check your inputs.',
      data: null,
    };
  }

  try {
    const result = await summarizeDocument(validatedFields.data as SummarizeDocumentInput);
    return {
      message: 'success',
      data: result,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'error',
      error: 'An unexpected error occurred. Please try again.',
      data: null,
    };
  }
}
