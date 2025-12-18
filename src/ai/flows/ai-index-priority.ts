'use server';

/**
 * @fileOverview An AI agent that analyzes documents and prioritizes their indexing based on content.
 *
 * - aiIndexPriority - A function that determines if a document should be high-priority for indexing.
 * - AiIndexPriorityInput - The input type for the aiIndexPriority function.
 * - AiIndexPriorityOutput - The return type for the aiIndexPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiIndexPriorityInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The text content of the document to be analyzed.'),
  fileName: z.string().describe('The name of the document.'),
});
export type AiIndexPriorityInput = z.infer<typeof AiIndexPriorityInputSchema>;

const AiIndexPriorityOutputSchema = z.object({
  isHighPriority: z
    .boolean()
    .describe(
      'Whether the document should be considered high priority for indexing.'
    ),
  reason:
    z.string()
    .describe(
      'The reason for the prioritization decision, based on the document content.'
    ),
});
export type AiIndexPriorityOutput = z.infer<typeof AiIndexPriorityOutputSchema>;

export async function aiIndexPriority(
  input: AiIndexPriorityInput
): Promise<AiIndexPriorityOutput> {
  return aiIndexPriorityFlow(input);
}

const aiIndexPriorityPrompt = ai.definePrompt({
  name: 'aiIndexPriorityPrompt',
  input: {schema: AiIndexPriorityInputSchema},
  output: {schema: AiIndexPriorityOutputSchema},
  prompt: `You are an AI assistant that helps prioritize document indexing.\n
  Analyze the content of the document and determine if it should be high priority for indexing.\n  Consider factors such as the presence of important keywords, the document\'s relevance to current events, and the potential impact of the document on user search results.\n
  Document Name: {{{fileName}}}\n  Document Content:\n  {{documentContent}}\n
  Based on your analysis, determine whether the document should be high priority for indexing. Explain your reasoning.\n  Set isHighPriority to true if the document should be prioritized, and false otherwise.\n  `,
});

const aiIndexPriorityFlow = ai.defineFlow(
  {
    name: 'aiIndexPriorityFlow',
    inputSchema: AiIndexPriorityInputSchema,
    outputSchema: AiIndexPriorityOutputSchema,
  },
  async input => {
    const {output} = await aiIndexPriorityPrompt(input);
    return output!;
  }
);
