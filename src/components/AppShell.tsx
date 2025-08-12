import { Routes, Route, useLocation } from "react-router-dom";
import TopAppBar from "@/components/TopAppBar";
import BottomNav from "@/components/BottomNav";
import { ReminderChecker } from "@/components/ReminderChecker";
import OnboardingGate from "@/components/OnboardingGate";
import Index from "@/pages/Index";
import Tasks from "@/pages/Tasks";
import Pieces from "@/pages/Pieces";
import PieceForm from "@/pages/PieceForm";
import PieceDetail from "@/pages/PieceDetail";
import PieceEditForm from "@/pages/PieceEditForm";
import Inspirations from "@/pages/Inspirations";
import InspirationForm from "@/pages/InspirationForm";
import InspirationDetail from "@/pages/InspirationDetail";
import Account from "@/pages/Account";
import StartNew from "@/pages/StartNew";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";

const AppShell = () => {
  const location = useLocation();
  const hideChrome = location.pathname === "/onboarding";

  return (
    <>
      {!hideChrome && <TopAppBar />}
      <OnboardingGate />
      <div className={hideChrome ? "" : "pt-16 pb-20"}>
        <ReminderChecker />
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Index />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/pieces" element={<Pieces />} />
          <Route path="/new/piece" element={<PieceForm />} />
          <Route path="/piece/:id" element={<PieceDetail />} />
          <Route path="/edit/piece/:id" element={<PieceEditForm />} />
          <Route path="/inspirations" element={<Inspirations />} />
          <Route path="/new/inspiration" element={<InspirationForm />} />
          <Route path="/inspiration/:id" element={<InspirationDetail />} />
          <Route path="/account" element={<Account />} />
          <Route path="/start-new" element={<StartNew />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!hideChrome && <BottomNav />}
    </>
  );
};

export default AppShell;
