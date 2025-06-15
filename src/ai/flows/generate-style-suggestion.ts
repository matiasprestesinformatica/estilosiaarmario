// src/ai/flows/generate-style-suggestion.ts
'use server';

/**
 * @fileOverview Generates style suggestions based on the user's wardrobe items.
 *
 * - generateStyleSuggestion - A function that generates style suggestions.
 * - GenerateStyleSuggestionInput - The input type for the generateStyleSuggestion function.
 * - GenerateStyleSuggestionOutput - The return type for the generateStyleSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClothingItemSchema = z.object({
  name: z.string().describe('The name of the clothing item.'),
  category: z.string().describe('The category of the clothing item (e.g., top, bottom, shoes).'),
  imageUrl: z.string().describe('URL of the clothing item image.'),
  description: z.string().optional().describe('Optional description of the item.'),
});

const GenerateStyleSuggestionInputSchema = z.object({
  wardrobe: z.array(ClothingItemSchema).describe('An array of clothing items in the user\'s wardrobe.'),
  occasion: z.string().optional().describe('The occasion for which the style suggestion is needed (e.g., casual, formal, party).'),
});
export type GenerateStyleSuggestionInput = z.infer<typeof GenerateStyleSuggestionInputSchema>;

const StyleSuggestionSchema = z.object({
  outfitSuggestion: z.string().describe('A detailed style suggestion based on the wardrobe items and occasion.'),
  reasoning: z.string().describe('Reasoning for choosing specific items from the wardrobe for the suggested style.'),
});

const GenerateStyleSuggestionOutputSchema = z.object({
  styleSuggestion: StyleSuggestionSchema,
});
export type GenerateStyleSuggestionOutput = z.infer<typeof GenerateStyleSuggestionOutputSchema>;

export async function generateStyleSuggestion(input: GenerateStyleSuggestionInput): Promise<GenerateStyleSuggestionOutput> {
  return generateStyleSuggestionFlow(input);
}

const suggestStylePrompt = ai.definePrompt({
  name: 'suggestStylePrompt',
  input: {schema: GenerateStyleSuggestionInputSchema},
  output: {schema: GenerateStyleSuggestionOutputSchema},
  prompt: `You are a personal stylist helping users create outfits from their existing wardrobe.

Given the following wardrobe items and occasion, provide a detailed style suggestion. Explain your reasoning for choosing specific items and how they complement each other.

Wardrobe Items:
{{#each wardrobe}}
- Name: {{name}}, Category: {{category}}, Description: {{description}}
{{/each}}

Occasion: {{occasion}}

Considerations:
- Suggest outfits that are both stylish and appropriate for the occasion.
- Prioritize using items that are versatile and can be mixed and matched.
- Provide clear and concise explanations for your choices.

Output:
{{~output~}}
`,
});

const generateStyleSuggestionFlow = ai.defineFlow(
  {
    name: 'generateStyleSuggestionFlow',
    inputSchema: GenerateStyleSuggestionInputSchema,
    outputSchema: GenerateStyleSuggestionOutputSchema,
  },
  async input => {
    const {output} = await suggestStylePrompt(input);
    return output!;
  }
);
