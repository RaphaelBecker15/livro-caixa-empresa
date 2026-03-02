import { ReactNode } from "react";
import { LayoutClientWrapper } from "@/components/LayoutClientWrapper";
import { createClient } from "@/lib/supabase/server";

export default async function LayoutUser({ children }: { children: ReactNode }) {
  
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  const role = authUser?.app_metadata?.role ?? 'empresa'

  const { data: user } = await supabase
    .from('User')
    .select('id, name, email, role')
    .eq('id', authUser!.id)
    .single()

  return (
    <LayoutClientWrapper role={role} user={user}>
      {children}
    </LayoutClientWrapper>
  )
}