'use server';

/**
 * @fileOverview Summarizes uploaded documents and articles for teachers, and provides an audio version.
 *
 * - summarizeDocument - A function that summarizes a given document and generates audio.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const SummarizeDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to be summarized.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document.'),
  audioDataUri: z.string().optional().describe('A data URI of the summary audio in WAV format.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

// Helper function to convert PCM audio buffer to WAV base64 string
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async ({ documentContent }) => {
    // Step 1: Generate the text summary
    const summaryResponse = await ai.generate({
        prompt: `You are an expert summarizer for teachers.
    
      Please provide a concise summary of the following document content, highlighting the key concepts and themes relevant for lesson planning. The summary should be clear, easy to understand, and structured with paragraphs and bullet points if appropriate.
    
      Document Content:
      ${documentContent}`,
      model: ai.model, // Use the default model configured in genkit.ts
    });

    const summaryText = summaryResponse.text;
    if (!summaryText) {
        throw new Error('Failed to generate summary text.');
    }
    
    // Step 2: Generate the audio from the summary text
    let audioDataUri: string | undefined;
    try {
        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' },
              },
            },
          },
          prompt: summaryText,
        });

        if (media) {
            const audioBuffer = Buffer.from(
              media.url.substring(media.url.indexOf(',') + 1),
              'base64'
            );
            const wavBase64 = await toWav(audioBuffer);
            audioDataUri = `data:audio/wav;base64,${wavBase64}`;
        }
    } catch(ttsError) {
        console.error("Text-to-speech generation failed:", ttsError);
        // We can still return the summary even if TTS fails
    }

    return {
      summary: summaryText,
      audioDataUri,
    };
  }
);
