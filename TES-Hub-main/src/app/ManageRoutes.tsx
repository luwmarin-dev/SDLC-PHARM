import { Navigate, Outlet } from "react-router-dom";
import usePermissions from "../lib/hooks/usePermissions";

const ManageRoutes = () => {
  const { can } = usePermissions();

  if (
    can("createArticle") ||
    can("createCourse") ||
    can("createSession") ||
    can("moderateContent")
  )
    return <Outlet />;

  return <Navigate to={"/"} replace />;
};

export default ManageRoutes;
