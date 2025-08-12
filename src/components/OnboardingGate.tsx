import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function hasUserOrGuest() {
  try {
    const user = localStorage.getItem("pt_user");
    const guest = localStorage.getItem("pt_guest_name");
    const skipped = localStorage.getItem("pt_onboarding_skipped") === "1";
    return Boolean(user || guest || skipped);
  } catch {
    return false;
  }
}

export const OnboardingGate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const allowList = ["/onboarding", "/account"]; // allow visiting these without redirect
    if (!hasUserOrGuest() && !allowList.includes(location.pathname)) {
      navigate("/onboarding", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default OnboardingGate;
