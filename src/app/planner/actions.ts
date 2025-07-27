
'use server';

import { z } from 'zod';
import { addEvent, deleteEvent } from '@/services/firestore';

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

const EventFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required.'),
  period: z.coerce.number().min(1).max(8),
  grade: z.string(),
  subject: z.string(),
});

export async function addEventAction(formData: FormData) {
  const validatedFields = EventFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    date: formData.get('date'),
    period: formData.get('period'),
    grade: formData.get('grade'),
    subject: formData.get('subject'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid data provided.' };
  }

  const newEvent = {
    ...validatedFields.data,
    description: validatedFields.data.description || '',
    date: new Date(validatedFields.data.date).toISOString().split('T')[0],
  };

  try {
    await addEvent(newEvent);
    return { success: true, message: 'Event added successfully.' };
  } catch (error) {
    console.error('Failed to add event:', error);
    return { success: false, message: 'Failed to add event.' };
  }
}

export async function addEventFromContent(content: GeneratedContent, date: Date, period: number) {
    const newEvent = {
        title: content.topic,
        description: `Scheduled from Content Generator: ${content.contentType} - ${content.learningObjective}`,
        date: date.toISOString().split('T')[0],
        period,
        grade: content.gradeLevel,
        subject: content.subject,
    };
    
    try {
        await addEvent(newEvent);
        return { success: true, message: 'Event added successfully.' };
    } catch (error) {
        console.error('Failed to add event from content:', error);
        return { success: false, message: 'Failed to schedule content.' };
    }
}


export async function deleteEventAction(eventId: string) {
  try {
    await deleteEvent(eventId);
    return { success: true, message: 'Event deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete event:', error);
    return { success: false, message: 'Failed to delete event.' };
  }
}
