'use client';

import * as React from 'react';
import { Bot } from 'lucide-react';

import { getAiSuggestion } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { PrioritizeIndexingOutput } from '@/ai/flows/prioritize-indexing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const sampleDocumentContent = `Project Hermes: Q3 2024 Launch Strategy

Executive Summary:
This document outlines the strategic plan for the launch of Project Hermes in the third quarter of 2024. The objective is to achieve a 15% market share in the B2B cloud solutions sector within the first six months post-launch. This initiative is critical for our annual revenue goals and positions us as a market leader.

Key Initiatives:
1.  **Finalize Development (July 1st):** Complete all beta testing and bug fixes. QA team to sign off.
2.  **Marketing Campaign Launch (July 15th):** A multi-channel digital marketing campaign targeting key industry verticals. Influencer partnerships and press releases are crucial. Budget: $500,000.
3.  **Sales Team Enablement (August 1st):** Training and new collateral for the global sales force.
4.  **Public Launch (September 1st):** Official release to the public. Monitor systems for performance and scalability.

Risks:
-   **Competitor Reaction:** A major competitor, "Aether Corp," is rumored to be launching a similar product.
-   **Technical Scalability:** The infrastructure must handle a projected 1 million concurrent users at peak.

This is a high-priority, confidential document. Dissemination is restricted to the executive team.
`;

export function AiIndexer() {
  const [documentContent, setDocumentContent] = React.useState(sampleDocumentContent);
  const [fileName, setFileName] = React.useState('Project_Hermes_Strategy.txt');
  const [result, setResult] = React.useState<PrioritizeIndexingOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!documentContent.trim() || !fileName.trim()) {
      toast({
        title: "Input Missing",
        description: "Please provide both a file name and document content.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const suggestion = await getAiSuggestion({ documentContent, fileName });
      setResult(suggestion);
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "The AI analysis could not be completed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">AI Indexing Suggestion Tool</h1>
        <p className="text-muted-foreground mb-6">Let AI reason about document content to determine if indexing a file's data should be high-priority.</p>
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Document Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="fileName" className="text-sm font-medium">File Name</label>
                        <Input 
                            id="fileName"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="e.g., meeting_notes.txt"
                        />
                    </div>
                    <div>
                        <label htmlFor="documentContent" className="text-sm font-medium">Document Content</label>
                        <Textarea 
                            id="documentContent"
                            value={documentContent}
                            onChange={(e) => setDocumentContent(e.target.value)}
                            placeholder="Paste your document content here..."
                            className="h-80 resize-none"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                        {isLoading ? 'Analyzing...' : 'Analyze and Suggest'}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>AI Suggestion</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    ) : result ? (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">Prioritization</h3>
                                <Badge variant={result.isHighPriority ? 'default' : 'secondary'} className={result.isHighPriority ? 'bg-accent text-accent-foreground' : ''}>
                                    {result.isHighPriority ? 'High Priority' : 'Normal Priority'}
                                </Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Reasoning</h3>
                                <p className="text-sm text-muted-foreground">{result.reason}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center">
                            <div className="text-muted-foreground">
                                <Bot className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Your analysis results will appear here.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
