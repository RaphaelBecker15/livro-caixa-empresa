"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SpinLoader } from "@/components/SpinLoader";

export function NavigationLoader() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, [pathname]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            if (!target) return;

            const href = target.getAttribute('href');
            if (!href || href === pathname || href.startsWith('#')) return;

            setLoading(true);
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 bottom-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center left-0 md:left-64 right-0">
            <SpinLoader className="h-auto" />
        </div>
    );
}