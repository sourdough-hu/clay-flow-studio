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
    const allowList = ["/auth", "/account", "/forgot-password"];
    const has = hasUserOrGuest();
    const atAuth = location.pathname === "/auth";

    if (!has && !allowList.includes(location.pathname)) {
      navigate("/auth", { replace: true });
    } else if (has && atAuth) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default OnboardingGate;
