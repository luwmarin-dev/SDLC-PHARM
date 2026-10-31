import axios from "axios";
import { endPoint } from "../../settings.json";
import { useAuthStore } from "../../store/authStore";

const axiosInstance = axios.create({
  baseURL: endPoint,
});

axiosInstance.interceptors.request.use((config) => {
  // Read through the store rather than parsing localStorage by hand: the
  // persisted shape is an implementation detail of the persist middleware,
  // and the store stays correct after login/logout within the same session.
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
