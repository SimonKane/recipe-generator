import { useState } from "react";
import { IngredientInput } from "@/components/IngredientInput";
import { RecipeCard, Recipe } from "@/components/RecipeCard";
import { useToast } from "@/hooks/use-toast";
import { recipeAPI } from "@/lib/recipeAPI";
import { Loader2, UtensilsCrossed } from "lucide-react";
import heroImage from "@/assets/hero-ingredients.jpg";

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRecipes = async (ingredients: string[]) => {
    setIsLoading(true);
    setRecipes([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipes`,
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
      setRecipes(data.recipes);

      toast({
        title: "Recipes Generated!",
        description: `Found ${data.recipes.length} delicious recipe${data.recipes.length > 1 ? 's' : ''} for you.`,
      });
    } catch (error) {
      console.error("Error generating recipes:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recipes. Please try again.",
        variant: "destructive",
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

          <IngredientInput onGenerate={generateRecipes} isLoading={isLoading} />
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
                showSaveButton={true}
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
