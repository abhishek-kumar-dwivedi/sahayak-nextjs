// src/ai/flows/content-generation.ts
'use server';
/**
 * @fileOverview A content generation AI agent for teachers.
 *
 * - generateContent - A function that handles the content generation process.
 * - ContentGenerationInput - The input type for the generateContent function.
 * - ContentGenerationOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentGenerationInputSchema = z.object({
  topic: z.string().describe('The topic for which content should be generated.'),
  gradeLevel: z.string().describe('The grade level of the students.'),
  subject: z.string().describe('The subject of the content.'),
  learningObjective: z.string().describe('The learning objective of the content.'),
  contentType: z
    .enum([
      'lesson plan',
      'quiz',
      'worksheet',
      'summary',
      'assignment',
      'sample problems',
    ])
    .describe('The type of content to generate.'),
});
export type ContentGenerationInput = z.infer<typeof ContentGenerationInputSchema>;

const ContentGenerationOutputSchema = z.object({
  content: z.string().describe('The generated educational content.'),
});
export type ContentGenerationOutput = z.infer<typeof ContentGenerationOutputSchema>;

export async function generateContent(input: ContentGenerationInput): Promise<ContentGenerationOutput> {
  return contentGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentGenerationPrompt',
  input: {schema: ContentGenerationInputSchema},
  output: {schema: ContentGenerationOutputSchema},
  prompt: `You are an expert educational content generator. You will generate high quality content for teachers.

  The content should be tailored to the specified grade level, subject, and learning objective. The content should be well-structured, engaging, and accurate.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  Subject: {{{subject}}}
  Learning Objective: {{{learningObjective}}}
  Content Type: {{{contentType}}}

  Content:`,
});

const contentGenerationFlow = ai.defineFlow(
  {
    name: 'contentGenerationFlow',
    inputSchema: ContentGenerationInputSchema,
    outputSchema: ContentGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
