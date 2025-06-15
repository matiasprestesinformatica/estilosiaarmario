
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

// Keep ClothingItemSchema definition consistent with how it's defined for input elsewhere if possible,
// but for the AI's direct output regarding *selected* items, we only need their identifiers (like name).
const ClothingItemReferenceSchema = z.object({
  name: z.string().describe('The exact name of the clothing item from the wardrobe.'),
  // category: z.string().describe('The category of the clothing item from the wardrobe.'), // Optional, name might be enough
});

const GenerateStyleSuggestionInputSchema = z.object({
  wardrobe: z.array(
    z.object({
      id: z.string(), // Important to have ID if we want to map back easily
      name: z.string(),
      category: z.string(),
      imageUrl: z.string(),
      description: z.string().optional(),
    })
  ).describe('An array of clothing items in the user\'s wardrobe, including their IDs.'),
  occasion: z.string().optional().describe('The occasion for which the style suggestion is needed (e.g., casual, formal, party).'),
});
export type GenerateStyleSuggestionInput = z.infer<typeof GenerateStyleSuggestionInputSchema>;


const StyleSuggestionSchema = z.object({
  outfitSuggestion: z.string().describe('A detailed style suggestion based on the wardrobe items and occasion.'),
  reasoning: z.string().describe('Reasoning for choosing specific items from the wardrobe for the suggested style.'),
  suggestedItemNames: z.array(z.string()).describe('An array of exact names of the clothing items from the provided wardrobe that are part of this suggestion. These names must match items from the input wardrobe list.'),
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

Given the following wardrobe items and occasion, provide a detailed style suggestion. 
First, explicitly list the names of the items you are choosing from the wardrobe for this outfit under the 'suggestedItemNames' field in your output. These names MUST EXACTLY MATCH items from the 'Wardrobe Items' list provided below.
Then, explain your reasoning for choosing these specific items and how they complement each other for the occasion.

Wardrobe Items:
{{#each wardrobe}}
- Name: {{name}}, Category: {{category}}, Description: {{description}} (ID: {{id}})
{{/each}}

Occasion: {{#if occasion}}{{occasion}}{{else}}Any/General{{/if}}

Considerations:
- Suggest outfits that are both stylish and appropriate for the occasion.
- Prioritize using items that are versatile and can be mixed and matched.
- Provide clear and concise explanations for your choices.
- Ensure the 'suggestedItemNames' field contains an array of strings, where each string is the exact name of an item from the wardrobe list.

Output format should strictly follow the schema. Example for 'styleSuggestion' part of the output:
{
  "outfitSuggestion": "For a casual weekend, pair the 'Classic Blue Jeans' with the 'White Cotton Tee' and the 'Comfortable Sneakers'. This creates a relaxed yet put-together look.",
  "reasoning": "The jeans provide a comfortable base, the tee is a versatile classic, and the sneakers ensure comfort for all-day wear. The colors are neutral and easy to combine.",
  "suggestedItemNames": ["Classic Blue Jeans", "White Cotton Tee", "Comfortable Sneakers"]
}

Provide your response in the structure defined by the output schema.
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
    // Ensure description is not null/undefined for the prompt, provide a default if necessary.
    const processedWardrobe = input.wardrobe.map(item => ({
      ...item,
      description: item.description || `A ${item.category} named ${item.name}.`,
    }));

    const {output} = await suggestStylePrompt({ ...input, wardrobe: processedWardrobe });
    
    if (!output) {
      throw new Error("AI failed to generate a suggestion.");
    }
    // Validate that suggestedItemNames actually exist in the input wardrobe
    // This is a client-side/flow-side validation, as LLM might hallucinate.
    const wardrobeNames = new Set(input.wardrobe.map(item => item.name));
    const validSuggestedNames = output.styleSuggestion.suggestedItemNames.filter(name => wardrobeNames.has(name));
    
    if (output.styleSuggestion.suggestedItemNames.length !== validSuggestedNames.length) {
        console.warn("AI suggested item names not found in wardrobe. Filtering to valid names.", 
        "Original:", output.styleSuggestion.suggestedItemNames, 
        "Valid:", validSuggestedNames);
    }

    return {
      styleSuggestion: {
        ...output.styleSuggestion,
        suggestedItemNames: validSuggestedNames, // Use only valid names
      }
    };
  }
);
