// API service for backend integration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface Recipe {
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

export interface RecipeSearchResult {
    recipes: Recipe[];
    total: number;
    page: number;
    size: number;
}

export interface SemanticSearchRequest {
    query: string;
    limit?: number;
    min_score?: number;
}

class RecipeAPI {
    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}/api/v1${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Create a new recipe
    async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> {
        return this.request('/recipes/', {
            method: 'POST',
            body: JSON.stringify(recipe),
        });
    }

    // Get recipes with pagination and filtering
    async getRecipes(options: {
        page?: number;
        size?: number;
        search?: string;
        cuisine?: string;
        difficulty?: string;
    } = {}): Promise<RecipeSearchResult> {
        const params = new URLSearchParams();

        if (options.page) params.append('page', options.page.toString());
        if (options.size) params.append('size', options.size.toString());
        if (options.search) params.append('search', options.search);
        if (options.cuisine) params.append('cuisine', options.cuisine);
        if (options.difficulty) params.append('difficulty', options.difficulty);

        const queryString = params.toString();
        const endpoint = `/recipes/${queryString ? `?${queryString}` : ''}`;

        return this.request(endpoint);
    }

    // Get a specific recipe by ID
    async getRecipe(id: number): Promise<Recipe> {
        return this.request(`/recipes/${id}`);
    }

    // Update a recipe
    async updateRecipe(id: number, recipe: Partial<Recipe>): Promise<Recipe> {
        return this.request(`/recipes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(recipe),
        });
    }

    // Delete a recipe
    async deleteRecipe(id: number): Promise<void> {
        return this.request(`/recipes/${id}`, {
            method: 'DELETE',
        });
    }

    // Semantic search for recipes
    async semanticSearch(searchRequest: SemanticSearchRequest): Promise<Recipe[]> {
        return this.request('/recipes/search/semantic', {
            method: 'POST',
            body: JSON.stringify(searchRequest),
        });
    }

    // Save a recipe (helper method for generated recipes)
    async saveGeneratedRecipe(generatedRecipe: any): Promise<Recipe> {
        console.log('Converting generated recipe:', generatedRecipe);

        // Convert from generated recipe format to backend format
        const recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'> = {
            title: generatedRecipe.title || generatedRecipe.name,
            description: generatedRecipe.description || '',
            ingredients: generatedRecipe.ingredients || [],
            instructions: Array.isArray(generatedRecipe.instructions)
                ? generatedRecipe.instructions.join('\n')
                : generatedRecipe.instructions || '',
            prep_time: this.parseTimeString(generatedRecipe.prep_time || generatedRecipe.prepTime),
            cook_time: this.parseTimeString(generatedRecipe.cook_time || generatedRecipe.cookTime),
            servings: generatedRecipe.servings || 1,
            difficulty: generatedRecipe.difficulty || 'medium',
            cuisine: generatedRecipe.cuisine || '',
            tags: generatedRecipe.tags || [],
        };

        console.log('Converted recipe for backend:', recipe);
        return this.createRecipe(recipe);
    }

    // Helper method to parse time strings like "30 min" to numbers
    private parseTimeString(timeStr: string | number): number | undefined {
        if (typeof timeStr === 'number') return timeStr;
        if (!timeStr) return undefined;

        const match = timeStr.toString().match(/(\d+)/);
        return match ? parseInt(match[1]) : undefined;
    }
}

export const recipeAPI = new RecipeAPI();
export default recipeAPI;