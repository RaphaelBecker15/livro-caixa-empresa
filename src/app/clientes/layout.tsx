import { ReactNode } from "react";
import LayoutUser from "@/components/LayoutUser";

export default function ClientesLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutUser>
        {children}
    </LayoutUser>
  )
}