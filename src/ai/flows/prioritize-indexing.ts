'use server';

/**
 * @fileOverview An AI agent that analyzes documents and prioritizes their indexing based on content.
 *
 * - prioritizeIndexing - A function that determines if a document should be high-priority for indexing.
 * - PrioritizeIndexingInput - The input type for the prioritizeIndexing function.
 * - PrioritizeIndexingOutput - The return type for the prioritizeIndexing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeIndexingInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The text content of the document to be analyzed.'),
  fileName: z.string().describe('The name of the document.'),
});
export type PrioritizeIndexingInput = z.infer<typeof PrioritizeIndexingInputSchema>;

const PrioritizeIndexingOutputSchema = z.object({
  isHighPriority: z
    .boolean()
    .describe(
      'Whether the document should be considered high priority for indexing.'
    ),
  reason: z
    .string()
    .describe(
      'The reason for the prioritization decision, based on the document content.'
    ),
});
export type PrioritizeIndexingOutput = z.infer<typeof PrioritizeIndexingOutputSchema>;

export async function prioritizeIndexing(
  input: PrioritizeIndexingInput
): Promise<PrioritizeIndexingOutput> {
  return prioritizeIndexingFlow(input);
}

const prioritizeIndexingPrompt = ai.definePrompt({
  name: 'prioritizeIndexingPrompt',
  input: {schema: PrioritizeIndexingInputSchema},
  output: {schema: PrioritizeIndexingOutputSchema},
  prompt: `You are an AI assistant that helps prioritize document indexing.

  Analyze the content of the document and determine if it should be high priority for indexing.
  Consider factors such as the presence of important keywords, the document's relevance to current events, and the potential impact of the document on user search results.

  Document Name: {{{fileName}}}
  Document Content:
  {{documentContent}}

  Based on your analysis, determine whether the document should be high priority for indexing. Explain your reasoning.
  Set isHighPriority to true if the document should be prioritized, and false otherwise.
  `,
});

const prioritizeIndexingFlow = ai.defineFlow(
  {
    name: 'prioritizeIndexingFlow',
    inputSchema: PrioritizeIndexingInputSchema,
    outputSchema: PrioritizeIndexingOutputSchema,
  },
  async input => {
    const {output} = await prioritizeIndexingPrompt(input);
    return output!;
  }
);
