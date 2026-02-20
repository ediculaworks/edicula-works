"use client";

import { ReactNode, createContext, useContext } from "react";
import { useSession } from "@/lib/auth-client";

type Session = ReturnType<typeof useSession>["data"];
type SessionContextType = {
  session: Session;
  isPending: boolean;
  isRefetching: boolean;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useAuthSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within a SessionProvider");
  }
  return context;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, isRefetching } = useSession();
  
  return (
    <SessionContext.Provider value={{ session, isPending, isRefetching }}>
      {children}
    </SessionContext.Provider>
  );
}
