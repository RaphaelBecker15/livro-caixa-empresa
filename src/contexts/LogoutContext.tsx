"use client";
import { createContext, useContext, useState, type ReactNode } from 'react';

interface LogoutContextType {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

export function LogoutProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState(false);
  
  return (
    <LogoutContext.Provider value={{ openModal, setOpenModal }}>
      {children}
    </LogoutContext.Provider>
  );
}

export function useLogout() {
  const context = useContext(LogoutContext);
  
  if (!context) {
    throw new Error('useLogout must be used within LogoutProvider');
  }
  
  return context;
}