import { ReactNode } from "react";
import LayoutUser from "@/components/LayoutUser";

export default function ProdutosLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutUser>
        {children}
    </LayoutUser>
  )
}