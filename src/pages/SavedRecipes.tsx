import { useState, useEffect } from "react";
import { RecipeCard, BackendRecipe } from "@/components/RecipeCard";
import { useToast } from "@/hooks/use-toast";
import { recipeAPI, Recipe, RecipeSearchResult } from "@/lib/recipeAPI";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChefHat, BookOpen } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SavedRecipes = () => {
    const [recipes, setRecipes] = useState<BackendRecipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [semanticSearchQuery, setSemanticSearchQuery] = useState("");
    const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
    const [pagination, setPagination] = useState({
        page: 1,
        size: 10,
        total: 0,
    });
    const { toast } = useToast();

    // Load recipes on component mount and when filters change
    useEffect(() => {
        loadRecipes();
    }, [pagination.page, selectedCuisine, selectedDifficulty, searchQuery]);

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const result: RecipeSearchResult = await recipeAPI.getRecipes({
                page: pagination.page,
                size: pagination.size,
                search: searchQuery || undefined,
                cuisine: selectedCuisine === "all" ? undefined : selectedCuisine,
                difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
            });

            setRecipes(result.recipes);
            setPagination(prev => ({
                ...prev,
                total: result.total,
            }));

            // Print the loaded recipes to console
            console.log("=== SAVED RECIPES LOADED ===");
            console.log(`Total recipes found: ${result.total}`);
            console.log("Recipes:", result.recipes);
            result.recipes.forEach((recipe, index) => {
                console.log(`\n--- Recipe ${index + 1} ---`);
                console.log(`Title: ${recipe.title}`);
                console.log(`Description: ${recipe.description}`);
                console.log(`Ingredients: ${recipe.ingredients?.join(', ')}`);
                console.log(`Instructions: ${recipe.instructions}`);
                console.log(`Prep Time: ${recipe.prep_time} minutes`);
                console.log(`Cook Time: ${recipe.cook_time} minutes`);
                console.log(`Servings: ${recipe.servings}`);
                console.log(`Difficulty: ${recipe.difficulty}`);
                console.log(`Cuisine: ${recipe.cuisine}`);
                console.log(`Tags: ${recipe.tags?.join(', ')}`);
            });
        } catch (error) {
            console.error("Error loading recipes:", error);
            toast({
                title: "Error",
                description: "Failed to load saved recipes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSemanticSearch = async () => {
        if (!semanticSearchQuery.trim()) {
            return;
        }

        setLoading(true);
        try {
            const results = await recipeAPI.semanticSearch({
                query: semanticSearchQuery,
                limit: 20,
                min_score: 0.3,
            });

            setRecipes(results);
            setPagination(prev => ({
                ...prev,
                total: results.length,
            }));

            // Print the search results to console
            console.log("=== SEMANTIC SEARCH RESULTS ===");
            console.log(`Search query: "${semanticSearchQuery}"`);
            console.log(`Found ${results.length} matching recipes`);
            console.log("Search results:", results);
            results.forEach((recipe, index) => {
                console.log(`\n--- Search Result ${index + 1} ---`);
                console.log(`Title: ${recipe.title}`);
                console.log(`Description: ${recipe.description}`);
                console.log(`Ingredients: ${recipe.ingredients?.join(', ')}`);
                console.log(`Instructions: ${recipe.instructions}`);
                console.log(`Prep Time: ${recipe.prep_time} minutes`);
                console.log(`Cook Time: ${recipe.cook_time} minutes`);
                console.log(`Servings: ${recipe.servings}`);
                console.log(`Difficulty: ${recipe.difficulty}`);
                console.log(`Cuisine: ${recipe.cuisine}`);
                console.log(`Tags: ${recipe.tags?.join(', ')}`);
            });

            toast({
                title: "Search Complete",
                description: `Found ${results.length} matching recipes`,
            });
        } catch (error) {
            console.error("Error in semantic search:", error);
            toast({
                title: "Search Error",
                description: "Failed to perform semantic search",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecipe = async (id: number) => {
        try {
            await recipeAPI.deleteRecipe(id);
            toast({
                title: "Recipe Deleted",
                description: "Recipe has been removed from your collection",
            });
            // Reload recipes after deletion
            loadRecipes();
        } catch (error) {
            console.error("Error deleting recipe:", error);
            toast({
                title: "Error",
                description: "Failed to delete recipe",
                variant: "destructive",
            });
        }
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSemanticSearchQuery("");
        setSelectedCuisine("all");
        setSelectedDifficulty("all");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background" />

                <div className="relative container mx-auto px-4 py-20">
                    <div className="text-center space-y-4 mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm">
                                <BookOpen className="h-16 w-16 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                            My Saved Recipes
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your personal collection of saved recipes with powerful search capabilities
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="bg-card rounded-lg shadow-lg border p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Regular Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Search Recipes</label>
                            <Input
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Cuisine Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Cuisine</label>
                            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any cuisine" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any cuisine</SelectItem>
                                    <SelectItem value="italian">Italian</SelectItem>
                                    <SelectItem value="mexican">Mexican</SelectItem>
                                    <SelectItem value="asian">Asian</SelectItem>
                                    <SelectItem value="american">American</SelectItem>
                                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                                    <SelectItem value="indian">Indian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Difficulty Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Difficulty</label>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any difficulty</SelectItem>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reset Button */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">&nbsp;</label>
                            <Button
                                onClick={resetFilters}
                                variant="outline"
                                className="w-full"
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>

                    {/* Semantic Search */}
                    <div className="border-t border-border pt-4">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            AI-Powered Semantic Search
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Describe what you're looking for (e.g., 'healthy breakfast with protein')"
                                value={semanticSearchQuery}
                                onChange={(e) => setSemanticSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSemanticSearch()}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSemanticSearch}
                                disabled={loading || !semanticSearchQuery.trim()}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Use natural language to find recipes that match your preferences
                        </p>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Loading recipes...</p>
                        </div>
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="text-center py-12">
                        <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || semanticSearchQuery
                                ? "Try adjusting your search criteria"
                                : "Start by saving some recipes from the recipe generator"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onSave={() => { }} // Already saved
                                    showSaveButton={false}
                                    showDeleteButton={true}
                                    onDelete={() => recipe.id && handleDeleteRecipe(recipe.id)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.total > pagination.size && (
                            <div className="flex justify-center items-center space-x-4">
                                <Button
                                    variant="outline"
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Previous
                                </Button>
                                <span className="text-muted-foreground">
                                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SavedRecipes;