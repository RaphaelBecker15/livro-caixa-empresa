"use client";
import { LogoutProvider } from "@/contexts/LogoutContext";
import { Sidebar } from "@/components/Sidebar";
import { LogoutModal } from "@/components/LogoutModal";
import { AuthProvider } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import { useState } from "react";
import { ToastContainer, Bounce } from "react-toastify";
import { NavigationLoader } from "@/components/NavigationLoader";
import { AuthUser } from "@/lib/types";
import { Menu } from "lucide-react";

interface LayoutClientWrapperProps {
    children: ReactNode
    user: AuthUser | null
}

export function LayoutClientWrapper({ children, user }: LayoutClientWrapperProps) {

     const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <AuthProvider user={user}>
            <LogoutProvider>
                <NavigationLoader />
                <div className="flex min-h-screen">
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
                    <main className="flex-1 md:ml-64 w-full min-w-0">
                        {/* Header mobile com botão de abrir sidebar */}
                        <div className="md:hidden flex items-center gap-4 px-4 py-3 bg-slate-900 sticky top-0 z-10">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="cursor-pointer text-white p-1"
                            >
                                <Menu size={24} />
                            </button>
                            <span className="text-white font-semibold text-sm">Grupo Rezende</span>
                        </div>

                        <div className="p-4 md:p-5">
                            {children}
                        </div>
                    </main>
                </div>
                <LogoutModal />
                <ToastContainer 
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable={false}
                    pauseOnHover={false}
                    theme="light"
                    transition={Bounce}
                />
            </LogoutProvider>
        </AuthProvider>
    );
}