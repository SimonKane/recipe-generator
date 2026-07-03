/**
 * SUPABASE EDGE FUNCTION: Recipe Generator
 * 
 * This function takes a list of ingredients and uses AI to generate creative recipes.
 * It also generates images for each recipe using AI image generation.
 * 
 * Flow:
 * 1. Receive ingredients from client
 * 2. Call AI service to generate recipes
 * 3. Parse AI response into structured data
 * 4. Generate images for each recipe
 * 5. Return recipes with images to client
 */

// ============================================================================
// TYPE DECLARATIONS FOR DENO RUNTIME ENVIRONMENT
// ============================================================================
// Supabase Edge Functions run on Deno, not Node.js, so we need to declare
// the Deno-specific globals that aren't available in standard TypeScript

declare global {
  // Deno runtime environment object - provides access to environment variables
  const Deno: {
    env: {
      get: (key: string) => string | undefined;
    };
  };

  // HTTP server function - creates a web server that handles incoming requests
  function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}

// ============================================================================
// DENO MODULE IMPORTS
// ============================================================================
// These imports work at runtime in Deno/Supabase Edge Functions
// @ts-ignore suppresses TypeScript errors since VS Code doesn't understand Deno URLs
// @ts-ignore - HTTP server functionality
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - XMLHttpRequest polyfill for fetch API compatibility
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// ============================================================================
// TYPESCRIPT INTERFACE DEFINITIONS
// ============================================================================
// These interfaces define the shape of data structures used throughout the function
// They provide type safety and make the code self-documenting

// Structure of the incoming request from the client
interface RequestBody {
  ingredients: string[]; // Array of ingredient names (e.g., ["chicken", "rice", "broccoli"])
}

// Structure of a single recipe object
interface Recipe {
  name: string;                                    // Recipe title (e.g., "Chicken Fried Rice")
  prepTime: string;                                // Preparation time (e.g., "15 mins")
  cookTime: string;                                // Cooking time (e.g., "25 mins")
  difficulty: "Easy" | "Medium" | "Hard";          // Difficulty level (restricted to these 3 options)
  servings: number;                                // Number of people this serves (e.g., 4)
  ingredients: string[];                           // Full ingredient list with measurements
  instructions: string[];                          // Step-by-step cooking instructions
  imageUrl?: string;                               // Optional AI-generated image URL (? means optional)
}

// Structure of successful API response sent back to client
interface RecipeResponse {
  recipes: Recipe[]; // Array of recipe objects
}

// Structure of error response sent back to client when something goes wrong
interface ErrorResponse {
  error: string; // Human-readable error message
}

// Structure of response from the AI service (Lovable AI Gateway)
// This matches the format that the AI API returns to us
interface AIResponse {
  choices: Array<{
    message: {
      content: string;                             // The AI's text response (recipes in JSON format)
      images?: Array<{                             // Optional array of generated images
        image_url: {
          url: string;                             // URL to the generated image
        };
      }>;
    };
  }>;
}

// ============================================================================
// CORS CONFIGURATION
// ============================================================================
// CORS (Cross-Origin Resource Sharing) headers allow web browsers to make requests
// from different domains (e.g., your frontend at localhost:3000 to Supabase)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',                                          // Allow requests from any domain (in production, specify your domain)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Allow these headers in requests
};

// ============================================================================
// MAIN HTTP SERVER FUNCTION
// ============================================================================
// This creates an HTTP server that responds to requests
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests (browsers send these before the actual request)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========================================================================
    // STEP 1: EXTRACT AND VALIDATE INPUT
    // ========================================================================
    // Parse the JSON body from the request to get the ingredients
    const { ingredients }: RequestBody = await req.json();

    // Validate that we received at least one ingredient
    if (!ingredients || ingredients.length === 0) {
      const errorResponse: ErrorResponse = { error: 'Please provide at least one ingredient' };
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 400,                                                         // HTTP 400 = Bad Request (client error)
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }     // Spread CORS headers + JSON content type
        }
      );
    }

    // ========================================================================
    // STEP 2: GET API KEY FROM ENVIRONMENT
    // ========================================================================
    // Retrieve the AI service API key from environment variables
    // In Supabase, you set this in your project's Edge Function secrets
    const LOVABLE_API_KEY: string | undefined = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      const errorResponse: ErrorResponse = { error: 'AI service not configured' };
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 500,                                                         // HTTP 500 = Internal Server Error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ========================================================================
    // STEP 3: PREPARE AI PROMPTS
    // ========================================================================
    // System prompt: Defines the AI's role and instructions for generating recipes
    // This tells the AI how to behave and what format to use for responses
    const systemPrompt = `You are a creative chef and recipe expert. Generate 2-3 delicious recipes using the provided ingredients. 
    
For each recipe, provide:
- A creative recipe name
- Estimated prep time and cook time
- Difficulty level (Easy, Medium, or Hard)
- Complete ingredient list with measurements
- Step-by-step cooking instructions
- Serving size

Format your response as a JSON array of recipe objects with this structure:
[
  {
    "name": "Recipe Name",
    "prepTime": "15 mins",
    "cookTime": "30 mins",
    "difficulty": "Easy",
    "servings": 4,
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"]
  }
]

Be creative and ensure the recipes are practical and delicious!`;

    // User prompt: The specific request with the ingredients provided by the user
    const userPrompt = `Create 2-3 recipes using these ingredients: ${ingredients.join(', ')}`;

    console.log('Calling Lovable AI with ingredients:', ingredients);

    // ========================================================================
    // STEP 4: CALL AI SERVICE TO GENERATE RECIPES
    // ========================================================================
    // Make HTTP request to Lovable AI Gateway (which connects to Google's Gemini)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,                          // Authentication with API key
        'Content-Type': 'application/json',                                   // Specify JSON request body
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',                                     // Specify which AI model to use
        messages: [
          { role: 'system', content: systemPrompt },                          // System instructions
          { role: 'user', content: userPrompt }                              // User's actual request
        ],
        temperature: 0.8,                                                     // Controls creativity (0.0-1.0, higher = more creative)
      }),
    });

    // ========================================================================
    // STEP 5: HANDLE AI SERVICE ERRORS
    // ========================================================================
    // Check if the AI service returned an error and provide appropriate responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      // Handle specific error types with user-friendly messages
      if (response.status === 429) {
        // Too many requests - user needs to wait before trying again
        const errorResponse: ErrorResponse = { error: 'Rate limit exceeded. Please try again later.' };
        return new Response(
          JSON.stringify(errorResponse),
          {
            status: 429,                                                       // Pass through the 429 status
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (response.status === 402) {
        // Payment required - AI service credits are exhausted
        const errorResponse: ErrorResponse = { error: 'AI credits depleted. Please add credits to continue.' };
        return new Response(
          JSON.stringify(errorResponse),
          {
            status: 402,                                                       // Pass through the 402 status
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Generic error for any other AI service failures
      const errorResponse: ErrorResponse = { error: 'Failed to generate recipes' };
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ========================================================================
    // STEP 6: PARSE AI RESPONSE AND EXTRACT RECIPES
    // ========================================================================
    // Get the JSON response from the AI service
    const data: AIResponse = await response.json();
    const generatedContent: string = data.choices[0].message.content;

    console.log('AI response:', generatedContent);

    // Parse the AI's text response into structured recipe data
    let recipes: Recipe[];
    try {
      // The AI might wrap JSON in markdown code blocks (```json ... ```)
      // or just return raw JSON - we need to handle both cases

      // First, try to find JSON wrapped in markdown code blocks
      const jsonMatch: RegExpMatchArray | null = generatedContent.match(/```json\n?([\s\S]*?)\n?```/) ||
        generatedContent.match(/\[[\s\S]*\]/);                               // Or find any JSON array in the text

      // Extract just the JSON part (remove markdown if present)
      const jsonString: string = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedContent;

      // Parse the JSON string into our Recipe array structure
      recipes = JSON.parse(jsonString.trim()) as Recipe[];
    } catch (parseError) {
      // If JSON parsing fails, return an error to the user
      console.error('Failed to parse AI response:', parseError);
      const errorResponse: ErrorResponse = { error: 'Failed to parse recipe data' };
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // ========================================================================
    // STEP 7: GENERATE IMAGES FOR EACH RECIPE
    // ========================================================================
    console.log('Generating images for recipes...');

    // Use Promise.all to generate images for all recipes simultaneously (parallel processing)
    // This is faster than generating them one by one (sequential processing)
    const recipesWithImages: Recipe[] = await Promise.all(
      recipes.map(async (recipe: Recipe): Promise<Recipe> => {
        try {
          // Create a detailed prompt for generating an appealing food image
          const imagePrompt: string = `A professional, appetizing food photography shot of ${recipe.name}. The dish should look delicious and well-presented on a clean plate with natural lighting. High quality, restaurant-style presentation.`;

          // Call the AI image generation service (same AI gateway, different model)
          const imageResponse: Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',                  // Image generation model
              messages: [
                {
                  role: 'user',
                  content: imagePrompt
                }
              ],
              modalities: ['image', 'text']                                   // Enable both image and text generation
            }),
          });

          if (imageResponse.ok) {
            // Extract the image URL from the AI response
            const imageData: AIResponse = await imageResponse.json();
            const imageUrl: string | undefined = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

            // Return the recipe with the generated image URL added
            return { ...recipe, imageUrl };
          } else {
            // If image generation fails, return the recipe without an image
            console.error('Failed to generate image for recipe:', recipe.name);
            return recipe;
          }
        } catch (imageError) {
          // If there's any error in image generation, continue without the image
          console.error('Error generating image:', imageError);
          return recipe;                                                      // Recipe is still valid without image
        }
      })
    );

    // ========================================================================
    // STEP 8: RETURN SUCCESSFUL RESPONSE
    // ========================================================================
    // Package all recipes (now with images) into the response format
    const successResponse: RecipeResponse = { recipes: recipesWithImages };
    return new Response(
      JSON.stringify(successResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }       // HTTP 200 (success) is default
      }
    );

  } catch (error) {
    // ========================================================================
    // GLOBAL ERROR HANDLER
    // ========================================================================
    // This catches any unexpected errors that weren't handled above
    console.error('Error in generate-recipes function:', error);
    const errorResponse: ErrorResponse = {
      // Provide a safe error message (don't expose internal details to users)
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,                                                          // HTTP 500 = Internal Server Error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); // End of serve() function
