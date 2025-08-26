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
import Account from "./pages/Account";
import UnifiedAuth from "./pages/UnifiedAuth";
import BottomNav from "./components/BottomNav";
import TopAppBar from "./components/TopAppBar";
import AuthGate from "./components/AuthGate";
import ForgotPassword from "./pages/ForgotPassword";
import AppShell from "./components/AppShell";
import SupabaseSessionSync from "./components/SupabaseSessionSync";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupabaseSessionSync />
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
