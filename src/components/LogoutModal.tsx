"use client";
import { useLogout } from "@/contexts/LogoutContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export function LogoutModal() {

  const { openModal, setOpenModal } = useLogout();
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOpenModal(false)
    router.push('/')
  }
  
  return (
    <Modal 
      isOpen={openModal} 
      setModalOpen={() => setOpenModal(!openModal)}
      setTittle="Tem certeza que deseja sair?"
    >
        <form className="p-4 gap-4 flex justify-end">
            <button type="button" onClick={() => setOpenModal(false)} className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type='button' onClick={handleLogout} className='cursor-pointer px-6 py-2 bg-red-600 text-white hover:bg-red-500 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md'>Sim</button>
        </form>
    </Modal>
  );
}