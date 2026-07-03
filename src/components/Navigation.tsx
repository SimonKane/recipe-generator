import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, BookOpen, Home } from "lucide-react";

export const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="bg-card border-b border-border shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <UtensilsCrossed className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold text-foreground">RecipeAI</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Button
                            asChild
                            variant={location.pathname === "/" ? "default" : "ghost"}
                            className={location.pathname === "/" ? "bg-primary hover:bg-primary/90" : ""}
                        >
                            <Link to="/">
                                <Home className="h-4 w-4 mr-2" />
                                Generate Recipes
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant={location.pathname === "/saved-recipes" ? "default" : "ghost"}
                            className={location.pathname === "/saved-recipes" ? "bg-primary hover:bg-primary/90" : ""}
                        >
                            <Link to="/saved-recipes">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Saved Recipes
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};