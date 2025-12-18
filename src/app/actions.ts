'use server';

import {
  prioritizeIndexing,
  type PrioritizeIndexingInput,
  type PrioritizeIndexingOutput,
} from '@/ai/flows/prioritize-indexing';

export async function getAiSuggestion(
  input: PrioritizeIndexingInput
): Promise<PrioritizeIndexingOutput> {
  // In a real app, you might add authentication, validation, or logging here.
  const result = await prioritizeIndexing(input);
  return result;
}
