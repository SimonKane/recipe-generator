import { useState } from "react";
import { IngredientInput } from "@/components/IngredientInput";
import { RecipeCard, Recipe } from "@/components/RecipeCard";
import { useToast } from "@/hooks/use-toast";
import { recipeAPI } from "@/lib/recipeAPI";
import { Loader2, UtensilsCrossed } from "lucide-react";
import heroImage from "@/assets/hero-ingredients.jpg";

const buildImageUrl = (recipeName: string, ingredients: string[], seed = 1) => {
  const prompt = [
    "photorealistic plated food photography",
    "natural light",
    recipeName,
    `ingredients: ${ingredients.join(", ")}`,
  ].join(", ");

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=768&nologo=true&safe=true&seed=${seed}`;
};

const fallbackRecipes = (ingredients: string[]): Recipe[] => {
  const main = ingredients[0]?.trim() || "Ingredient";
  const firstName = `${main[0].toUpperCase()}${main.slice(1)} Weeknight Bowl`;
  const secondName = `Roasted ${main[0].toUpperCase()}${main.slice(1)} Tray`;

  return [
    {
      name: firstName,
      prepTime: "10 min",
      cookTime: "18 min",
      difficulty: "easy",
      servings: 2,
      ingredients: [...ingredients, "olive oil", "salt", "black pepper"],
      instructions: [
        `Prepare ${ingredients.join(", ")} by chopping everything into bite-sized pieces.`,
        "Heat a pan with olive oil and cook the firm ingredients first.",
        "Add the remaining ingredients and season with salt and pepper.",
        "Serve warm in bowls with any sauce, herbs, or leftovers you like.",
      ],
      imageUrl: buildImageUrl(firstName, ingredients, 101),
    },
    {
      name: secondName,
      prepTime: "12 min",
      cookTime: "25 min",
      difficulty: "medium",
      servings: 3,
      ingredients: [...ingredients, "garlic", "lemon juice", "dried herbs"],
      instructions: [
        "Preheat the oven to 220 C.",
        "Toss the ingredients with garlic, lemon juice, herbs, salt, and oil.",
        "Roast on a tray until browned and cooked through.",
        "Taste, adjust seasoning, and serve with bread, rice, or salad.",
      ],
      imageUrl: buildImageUrl(secondName, ingredients, 202),
    },
  ];
};

const generateInFrontend = async (ingredients: string[]): Promise<Recipe[]> => {
  const prompt = [
    `Create 2 practical recipes from these ingredients: ${ingredients.join(", ")}.`,
    "Return only valid JSON, no markdown.",
    'Use this shape: {"recipes":[{"name":"...","prepTime":"10 min","cookTime":"20 min","difficulty":"easy","servings":2,"ingredients":["..."],"instructions":["step 1","step 2"]}]}',
  ].join(" ");

  const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
  if (!response.ok) {
    throw new Error("Free AI service failed");
  }

  const raw = await response.text();
  const cleaned = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const data = JSON.parse(cleaned);

  const generatedRecipes = (data.recipes || []).map((recipe: Partial<Recipe>, index: number) => {
    const name = recipe.name || "AI Recipe";
    const recipeIngredients = recipe.ingredients?.length ? recipe.ingredients : ingredients;

    return {
      name,
      prepTime: recipe.prepTime || "10 min",
      cookTime: recipe.cookTime || "20 min",
      difficulty: recipe.difficulty || "medium",
      servings: recipe.servings || 2,
      ingredients: recipeIngredients,
      instructions: recipe.instructions?.length ? recipe.instructions : ["Cook everything until delicious."],
      imageUrl: buildImageUrl(name, recipeIngredients, index + 1),
    };
  });

  return [...generatedRecipes, ...fallbackRecipes(ingredients)].slice(0, 2);
};

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canSaveRecipes, setCanSaveRecipes] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(
    () => localStorage.getItem("recipeai-generation-used") === "true"
  );
  const { toast } = useToast();

  const generateRecipes = async (ingredients: string[]) => {
    if (hasGenerated) {
      toast({
        title: "Demo limit reached",
        description: "This showcase allows one AI generation per browser.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRecipes([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/v1/recipes/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredients }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate recipes");
      }

      const data = await response.json();
      const backendRecipes = [...(data.recipes || []), ...fallbackRecipes(ingredients)].slice(0, 2);
      setRecipes(backendRecipes);
      setCanSaveRecipes(true);
      localStorage.setItem("recipeai-generation-used", "true");
      setHasGenerated(true);

      toast({
        title: "Recipes Generated!",
        description: `Found ${backendRecipes.length} delicious recipes for you via ${data.source || "AI"}.`,
      });
    } catch (error) {
      console.error("Error generating recipes:", error);
      const frontendRecipes = await generateInFrontend(ingredients).catch(() => fallbackRecipes(ingredients));
      setRecipes(frontendRecipes);
      setCanSaveRecipes(false);
      localStorage.setItem("recipeai-generation-used", "true");
      setHasGenerated(true);

      toast({
        title: "Generated in frontend-only mode",
        description: "Backend was unavailable, so the showcase used the free browser fallback.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      await recipeAPI.saveGeneratedRecipe(recipe);
      toast({
        title: "Recipe Saved!",
        description: "Recipe has been added to your collection.",
      });
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background" />

        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm">
                <UtensilsCrossed className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              AI Recipe Generator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your ingredients into culinary masterpieces with the power of AI
            </p>
          </div>

          <IngredientInput
            onGenerate={generateRecipes}
            isLoading={isLoading}
            limitReached={hasGenerated}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Creating delicious recipes just for you...
            </p>
          </div>
        </div>
      )}

      {/* Recipes Display */}
      {recipes.length > 0 && !isLoading && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            Your Personalized Recipes
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={index}
                recipe={recipe}
                onSave={handleSaveRecipe}
                showSaveButton={canSaveRecipes}
                showDeleteButton={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recipes.length === 0 && !isLoading && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Enter your ingredients above to get started!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
