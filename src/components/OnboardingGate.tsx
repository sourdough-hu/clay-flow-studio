import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function hasUserOrGuest() {
  try {
    const user = localStorage.getItem("pt_user");
    const guest = localStorage.getItem("pt_guest_name");
    return Boolean(user || guest);
  } catch {
    return false;
  }
}

export const OnboardingGate = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const allowList = ["/onboarding", "/account"];
    const has = hasUserOrGuest();
    const atOnboarding = location.pathname === "/onboarding";

    if (!has && !allowList.includes(location.pathname)) {
      navigate("/onboarding", { replace: true });
    } else if (has && atOnboarding) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default OnboardingGate;
