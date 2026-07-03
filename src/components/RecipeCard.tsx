import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Users, Heart, Trash2 } from "lucide-react";

// Original recipe interface (from recipe generation)
export interface Recipe {
  name: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
}

// Backend recipe interface
export interface BackendRecipe {
  id?: number;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface RecipeCardProps {
  recipe: Recipe | BackendRecipe;
  onSave?: (recipe: Recipe | BackendRecipe) => void;
  onDelete?: () => void;
  showSaveButton?: boolean;
  showDeleteButton?: boolean;
}

const retryImageUrl = (imageUrl: string, retry: number) => {
  try {
    const url = new URL(imageUrl);
    url.searchParams.set("seed", String(700 + retry));
    url.searchParams.set("model", "flux");
    url.searchParams.set("safe", "true");
    return url.toString();
  } catch {
    return imageUrl;
  }
};

const RecipeImage = ({ imageUrl, recipeName }: { imageUrl: string; recipeName: string }) => {
  const [retry, setRetry] = useState(0);
  const [src, setSrc] = useState(imageUrl);

  useEffect(() => {
    setRetry(0);
    setSrc(imageUrl);
  }, [imageUrl]);

  const handleError = () => {
    if (retry < 3) {
      const nextRetry = retry + 1;
      setRetry(nextRetry);
      setSrc(retryImageUrl(imageUrl, nextRetry));
    }
  };

  return (
    <div className="relative h-64 w-full overflow-hidden bg-muted">
      <img
        src={src}
        alt={recipeName}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={handleError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
};

export const RecipeCard = ({
  recipe,
  onSave,
  onDelete,
  showSaveButton = true,
  showDeleteButton = false
}: RecipeCardProps) => {
  // Helper function to determine if recipe is from backend
  const isBackendRecipe = (recipe: Recipe | BackendRecipe): recipe is BackendRecipe => {
    return 'title' in recipe;
  };

  // Normalize recipe data
  const recipeName = isBackendRecipe(recipe) ? recipe.title : recipe.name;
  const recipeIngredients = recipe.ingredients;
  const recipeInstructions = isBackendRecipe(recipe)
    ? (typeof recipe.instructions === 'string' ? recipe.instructions.split('\n').filter(Boolean) : [recipe.instructions])
    : recipe.instructions;
  const recipeDifficulty = recipe.difficulty || 'medium';
  const recipeServings = recipe.servings || 1;
  const recipePrepTime = isBackendRecipe(recipe)
    ? (recipe.prep_time ? `${recipe.prep_time} min` : 'N/A')
    : recipe.prepTime;
  const recipeCookTime = isBackendRecipe(recipe)
    ? (recipe.cook_time ? `${recipe.cook_time} min` : 'N/A')
    : recipe.cookTime;
  const recipeDescription = isBackendRecipe(recipe) ? recipe.description : '';
  const recipeImageUrl = !isBackendRecipe(recipe) ? recipe.imageUrl : undefined;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-secondary text-secondary-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      case "hard":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(recipe);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300">
      {recipeImageUrl && (
        <RecipeImage imageUrl={recipeImageUrl} recipeName={recipeName} />
      )}
      <CardHeader className="bg-gradient-to-br from-card to-muted/30">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl font-bold text-foreground">
            {recipeName}
          </CardTitle>
          <Badge className={getDifficultyColor(recipeDifficulty)}>
            {recipeDifficulty}
          </Badge>
        </div>

        {recipeDescription && (
          <p className="text-sm text-muted-foreground mt-2">
            {recipeDescription}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>Prep: {recipePrepTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4" />
            <span>Cook: {recipeCookTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>Serves: {recipeServings}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div>
          <h4 className="font-semibold text-lg mb-3 text-foreground">Ingredients</h4>
          <ul className="space-y-2">
            {recipeIngredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span className="text-foreground/90">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3 text-foreground">Instructions</h4>
          <ol className="space-y-3">
            {recipeInstructions.map((instruction, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="font-semibold text-primary shrink-0">{index + 1}.</span>
                <span className="text-foreground/90">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action buttons */}
        {(showSaveButton || showDeleteButton) && (
          <div className="flex gap-2 pt-4 border-t">
            {showSaveButton && onSave && (
              <Button
                onClick={handleSave}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Heart className="h-4 w-4 mr-2" />
                Save Recipe
              </Button>
            )}
            {showDeleteButton && onDelete && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
