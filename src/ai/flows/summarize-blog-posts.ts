'use server';

/**
 * @fileOverview A flow for summarizing blog posts for display on the home page.
 *
 * - summarizeBlogPosts - A function that retrieves blog posts and generates summaries.
 * - SummarizeBlogPostsInput - The input type for the summarizeBlogPosts function.
 * - SummarizeBlogPostsOutput - The return type for the summarizeBlogPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBlogPostsInputSchema = z.object({
  blogPosts: z.array(
    z.object({
      title: z.string().describe('The title of the blog post.'),
      content: z.string().describe('The full content of the blog post.'),
    })
  ).describe('An array of blog posts to summarize.'),
});
export type SummarizeBlogPostsInput = z.infer<typeof SummarizeBlogPostsInputSchema>;

const SummarizeBlogPostsOutputSchema = z.array(
  z.object({
    title: z.string(),
    summary: z.string(),
  })
);
export type SummarizeBlogPostsOutput = z.infer<typeof SummarizeBlogPostsOutputSchema>;

export async function summarizeBlogPosts(input: SummarizeBlogPostsInput): Promise<SummarizeBlogPostsOutput> {
  return summarizeBlogPostsFlow(input);
}

const summarizeBlogPostPrompt = ai.definePrompt({
  name: 'summarizeBlogPostPrompt',
  input: {schema: SummarizeBlogPostsInputSchema},
  output: {schema: SummarizeBlogPostsOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing blog posts for display on a healthcare website's home page. Provide concise and engaging summaries.

Here are the blog posts you need to summarize:

{{#each blogPosts}}
Title: {{this.title}}
Content: {{this.content}}
---
{{/each}}

Summarize each blog post in one or two sentences, focusing on the key information and main takeaways. Return an array of objects, each containing the original title and the generated summary.`,
});

const summarizeBlogPostsFlow = ai.defineFlow(
  {
    name: 'summarizeBlogPostsFlow',
    inputSchema: SummarizeBlogPostsInputSchema,
    outputSchema: SummarizeBlogPostsOutputSchema,
  },
  async input => {
    const {output} = await summarizeBlogPostPrompt(input);
    return output!;
  }
);
