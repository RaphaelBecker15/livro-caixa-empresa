"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const LogoutContext = createContext<{
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
}>({ openModal: false, setOpenModal: () => {} });

export const useLogout = () => useContext(LogoutContext);

export function LogoutProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState(false);
  
  return (
    <LogoutContext.Provider value={{ openModal, setOpenModal }}>
      {children}
    </LogoutContext.Provider>
  );
}