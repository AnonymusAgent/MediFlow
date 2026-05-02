import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Activity } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary))]/10 flex items-center justify-center mx-auto mb-6">
          <Activity className="w-8 h-8 text-[hsl(var(--primary))]" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-foreground">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist in MediFlow.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
