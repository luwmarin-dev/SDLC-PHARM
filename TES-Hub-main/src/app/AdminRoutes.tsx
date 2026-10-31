import { Navigate, Outlet } from "react-router-dom";
import usePermissions from "../lib/hooks/usePermissions";

const AdminRoutes = () => {
  const { can } = usePermissions();

  if (can("manageUsers")) return <Outlet />;

  return <Navigate to={"/"} replace />;
};

export default AdminRoutes;
