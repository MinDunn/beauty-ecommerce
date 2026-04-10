import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { logout as logoutAction } from "../store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return {
    isAdmin,
    user,
    isAuthenticated,
    logout: () => dispatch(logoutAction()),
  };
};