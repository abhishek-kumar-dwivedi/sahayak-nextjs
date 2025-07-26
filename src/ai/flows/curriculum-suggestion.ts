// src/ai/flows/curriculum-suggestion.ts
'use server';

/**
 * @fileOverview A curriculum suggestion AI agent.
 *
 * - curriculumSuggestion - A function that handles the curriculum suggestion process.
 * - CurriculumSuggestionInput - The input type for the curriculumSuggestion function.
 * - CurriculumSuggestionOutput - The return type for the curriculumSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurriculumSuggestionInputSchema = z.object({
  topic: z.string().optional().describe('The topic for which to generate a curriculum.'),
  gradeLevel: z.string().describe('The grade level for the curriculum.'),
  subject: z.string().describe('The subject of the curriculum.'),
  documentContent: z.string().optional().describe("A data URI of a PDF document to be used for curriculum generation. Must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type CurriculumSuggestionInput = z.infer<typeof CurriculumSuggestionInputSchema>;

const CurriculumSuggestionOutputSchema = z.object({
    chapters: z.array(
        z.object({
            title: z.string().describe("The title of the chapter."),
            subTopics: z.array(
                z.object({
                    title: z.string().describe("The title of the sub-topic."),
                    description: z.string().describe("A brief description of the sub-topic."),
                })
            ).describe("A list of sub-topics within the chapter.")
        })
    ).describe("A list of chapters that form the curriculum outline.")
});
export type CurriculumSuggestionOutput = z.infer<typeof CurriculumSuggestionOutputSchema>;

export async function curriculumSuggestion(input: CurriculumSuggestionInput): Promise<CurriculumSuggestionOutput> {
  return curriculumSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curriculumSuggestionPrompt',
  input: {schema: CurriculumSuggestionInputSchema},
  output: {schema: CurriculumSuggestionOutputSchema},
  prompt: `You are an experienced teacher. Your task is to generate a curriculum outline for a given topic, grade level, and subject.

The curriculum should be structured into chapters, and each chapter should contain multiple sub-topics. Each sub-topic must have a title and a brief description.

Grade Level: {{{gradeLevel}}}
Subject: {{{subject}}}

{{#if topic}}
The curriculum should be based on the following topic:
Topic: {{{topic}}}
{{/if}}

{{#if documentContent}}
The curriculum should be based on the following document:
Document Content:
{{media url=documentContent}}
{{/if}}

Please generate the curriculum outline in the specified JSON format.
`,
});

const curriculumSuggestionFlow = ai.defineFlow(
  {
    name: 'curriculumSuggestionFlow',
    inputSchema: CurriculumSuggestionInputSchema,
    outputSchema: CurriculumSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
