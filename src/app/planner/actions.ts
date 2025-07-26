
'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

type CalendarEvent = {
  id: number;
  date: string;
  period: number;
  title: string;
  description: string;
  grade: string;
  subject: string;
};

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


const eventsFilePath = path.join(process.cwd(), 'src/data/events.json');

async function readEvents(): Promise<CalendarEvent[]> {
  try {
    const data = await fs.readFile(eventsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error("Failed to read events:", error);
    return [];
  }
}

async function writeEvents(data: CalendarEvent[]): Promise<void> {
    try {
        await fs.writeFile(eventsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Failed to write events:", error);
    }
}

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

  const newEvent: CalendarEvent = {
    id: Date.now(),
    ...validatedFields.data,
    description: validatedFields.data.description || '',
    date: new Date(validatedFields.data.date).toISOString().split('T')[0],
  };

  try {
    const events = await readEvents();
    events.push(newEvent);
    await writeEvents(events);
    return { success: true, message: 'Event added successfully.' };
  } catch (error) {
    console.error('Failed to add event:', error);
    return { success: false, message: 'Failed to add event.' };
  }
}

export async function addEventFromContent(content: GeneratedContent, date: Date, period: number) {
    const newEvent: CalendarEvent = {
        id: Date.now(),
        title: content.topic,
        description: `Scheduled from Content Generator: ${content.contentType} - ${content.learningObjective}`,
        date: date.toISOString().split('T')[0],
        period,
        grade: content.gradeLevel,
        subject: content.subject,
    };
    
    try {
        const events = await readEvents();
        events.push(newEvent);
        await writeEvents(events);
        return { success: true, message: 'Event added successfully.' };
    } catch (error) {
        console.error('Failed to add event from content:', error);
        return { success: false, message: 'Failed to schedule content.' };
    }
}


export async function deleteEventAction(eventId: number) {
  try {
    const events = await readEvents();
    const updatedEvents = events.filter(e => e.id !== eventId);
    await writeEvents(updatedEvents);
    return { success: true, message: 'Event deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete event:', error);
    return { success: false, message: 'Failed to delete event.' };
  }
}
