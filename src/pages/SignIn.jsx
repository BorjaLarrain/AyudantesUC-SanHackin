import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Auth from "./Auth";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Si quieres que siempre muestre el tab de signin
  useEffect(() => {
    if (location.pathname === "/signup") {
      navigate("/signin");
    }
  }, [location.pathname, navigate]);

  return <Auth />;
};

export default SignIn;