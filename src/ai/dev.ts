import { config } from 'dotenv';
config();

import '@/ai/flows/content-generation.ts';
import '@/ai/flows/summarize-documents.ts';
import '@/ai/flows/curriculum-suggestion.ts';