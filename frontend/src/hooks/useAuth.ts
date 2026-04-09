import { useState } from "react";

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  return {
    isAdmin,
    login: () => setIsAdmin(true),
    logout: () => setIsAdmin(false),
  };
};