import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../lib/hooks/useAuth";

const PrivateRoutes = () => {
  const user = useAuth();
  const location = useLocation();

  if (user) return <Outlet />;

  // Send guests to sign in rather than silently dropping them on the home
  // page, and remember where they were headed so we can return them there.
  const next = `${location.pathname}${location.search}`;
  return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
};

export default PrivateRoutes;
