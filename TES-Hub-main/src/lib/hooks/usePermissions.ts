import useAuth from "./useAuth";
import { PERMISSIONS, type Action } from "../permissions";
import type { Role } from "../../types/role";

export function usePermissions() {
  const user = useAuth();
  const role: Role = user?.role ?? "guest";
  const permissions = PERMISSIONS[role];

  const can = (action: Action) => permissions[action];

  return {
    role,
    isGuest: role === "guest",
    can,
    ...permissions,
  };
}

export default usePermissions;
