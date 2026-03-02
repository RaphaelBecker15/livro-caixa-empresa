"use client";
import { LayoutDashboard, LogOut, CircleUserRound, Users, Package, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/contexts/LogoutContext";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

const isActive = (path: string, location: string) => {
    return location === path ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white";
};

const NavItem = ({ to, icon: Icon, label, currentPath, onClick }: { to: string; icon: LucideIcon; label: string, currentPath: string, onClick?: () => void }) => (
    <Link href={to} onClick={onClick} className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(to, currentPath)}`}>
        <Icon size={20}/>
        <span className='font-medium'>{label}</span>
    </Link>
);

export function Sidebar({ isOpen, onClose }: SidebarProps) {

    const { user } = useAuth();
    const pathname = usePathname();
    const { setOpenModal } = useLogout();

    return (
        <>
            {/* Overlay mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 z-30 w-64 bg-slate-900 h-screen flex flex-col text-slate-300
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="p-6 border-b border-slate-800 flex gap-3 items-center">
                    <div className="flex-col text-left">
                        <h1 className="text-xl font-bold text-white tracking-tight">Livro Caixa</h1>
                    </div>
                </div>

                <nav className='flex-1 p-4 space-y-2'>
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" currentPath={pathname}/>
                    <NavItem to="/clientes" icon={Users} label="Clientes" currentPath={pathname}/>
                    <NavItem to="/produtos" icon={Package} label="Produtos" currentPath={pathname}/>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white">
                            <CircleUserRound size={250}/>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Usuário'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email ?? ''}</p>
                        </div>
                    </div>
                    <button onClick={() => setOpenModal(true)} className="cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors text-sm">
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            </div>
        </>
    );
};