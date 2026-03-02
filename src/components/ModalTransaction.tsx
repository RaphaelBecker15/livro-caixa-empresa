"use client";
import { X } from "lucide-react";

interface ModalTransactionProps {
    isOpen: boolean,
    setModalOpen: () => void,
    setTittle: string,
    children: React.ReactNode
}

export default function ModalTransaction({isOpen, setModalOpen, setTittle, children}: ModalTransactionProps) {
    if(isOpen){
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" style={{margin: 0}}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col animate-in fade-in zoom-in-95 duration-200" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl flex-shrink-0">
                        <h3 className="font-bold text-lg text-slate-800">{setTittle}</h3>
                        <button onClick={setModalOpen} className="text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-slate-200">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {children}
                    </div>
                </div>
            </div>
        )
    }

    return null;
}