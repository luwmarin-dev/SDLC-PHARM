import { useAuthStore } from "../../store/authStore";

const useAuth = () => useAuthStore((state) => state.user);

export default useAuth;
