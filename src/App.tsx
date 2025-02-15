
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import SystemDesign from "./pages/SystemDesign";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Navigation = () => (
  <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 fixed top-0 left-0 right-0 border-b border-border">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex h-14 items-center justify-between">
        <Link to="/" className="font-semibold">Mini Redis</Link>
        <div className="flex gap-4">
          <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link to="/system-design" className="text-muted-foreground hover:text-foreground transition-colors">
            System Design
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <div className="pt-14"> {/* Add padding for fixed navbar */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/system-design" element={<SystemDesign />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
