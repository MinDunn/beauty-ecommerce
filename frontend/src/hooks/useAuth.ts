import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { logout as logoutAction } from "../store/slices/authSlice";
import authService from "../api/authService";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const logout = async () => {
    try {
      if (isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      dispatch(logoutAction());
    }
  };

  return {
    isAdmin,
    user,
    isAuthenticated,
    logout,
  };
};