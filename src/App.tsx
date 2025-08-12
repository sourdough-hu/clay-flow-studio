import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pieces from "./pages/Pieces";
import PieceForm from "./pages/PieceForm";
import PieceDetail from "./pages/PieceDetail";
import Inspirations from "./pages/Inspirations";
import InspirationForm from "./pages/InspirationForm";
import { ReminderChecker } from "./components/ReminderChecker";
import Tasks from "./pages/Tasks";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="pb-20">
          <ReminderChecker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/pieces" element={<Pieces />} />
            <Route path="/new/piece" element={<PieceForm />} />
            <Route path="/piece/:id" element={<PieceDetail />} />
            <Route path="/inspirations" element={<Inspirations />} />
            <Route path="/new/inspiration" element={<InspirationForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
