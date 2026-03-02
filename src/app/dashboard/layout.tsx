import { ReactNode } from "react";
import LayoutUser from "@/components/LayoutUser";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutUser>
        {children}
    </LayoutUser>
  )
}