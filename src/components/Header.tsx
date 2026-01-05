import { Beaker, Sparkles, LogOut, BarChart3, FlaskConical } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { user, signOut } = useFirebaseAuth();
  const location = useLocation();

  return (
    <header className="w-full border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl pharma-gradient-bg flex items-center justify-center shadow-pharma">
                <Beaker className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
                PharmaComply AI
              </h1>
              <p className="text-sm text-muted-foreground">
                Drug–Excipient Compatibility Predictor
              </p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  location.pathname === "/" && "bg-secondary text-foreground"
                )}
              >
                <FlaskConical className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Prediction</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  location.pathname === "/analytics" && "bg-secondary text-foreground"
                )}
              >
                <BarChart3 className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>AI-Powered</span>
            </div>
          </div>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
