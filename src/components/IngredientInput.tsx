import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

interface IngredientInputProps {
  onGenerate: (ingredients: string[]) => void;
  isLoading: boolean;
}

export const IngredientInput = ({ onGenerate, isLoading }: IngredientInputProps) => {
  const [ingredients, setIngredients] = useState<string[]>([""]);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length ? newIngredients : [""]);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleGenerate = () => {
    const validIngredients = ingredients.filter(ing => ing.trim() !== "");
    if (validIngredients.length > 0) {
      onGenerate(validIngredients);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === ingredients.length - 1) {
        addIngredient();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-foreground">What's in your kitchen?</h2>
        <p className="text-muted-foreground">Enter your ingredients and let AI create amazing recipes for you</p>
      </div>

      <div className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Ingredient ${index + 1}`}
              value={ingredient}
              onChange={(e) => updateIngredient(index, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              className="flex-1"
              disabled={isLoading}
            />
            {ingredients.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeIngredient(index)}
                disabled={isLoading}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={addIngredient}
          disabled={isLoading}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isLoading || ingredients.every(ing => ing.trim() === "")}
          className="flex-1"
        >
          {isLoading ? "Generating..." : "Generate Recipes"}
        </Button>
      </div>
    </div>
  );
};
