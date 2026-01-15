"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/types";

type AuthContextType = {
  user: User;
  token?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({
  children,
  user,
  token,
}: {
  children: React.ReactNode;
  user: User;
  token?: string;
}) {
  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthContextProvider");
  }
  return context;
}

export function useIsTeamLead() {
  const { user } = useAuthContext();
  return user?.role === "TEAM_LEAD";
}

export function useIsMember() {
  const { user } = useAuthContext();
  return user?.role === "MEMBER";
}
