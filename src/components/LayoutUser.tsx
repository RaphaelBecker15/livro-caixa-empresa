import { ReactNode } from "react";
import { LayoutClientWrapper } from "@/components/LayoutClientWrapper";
import { createClient } from "@/lib/supabase/server";

export default async function LayoutUser({ children }: { children: ReactNode }) {
  
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const authUser = data.user

  const { data: user } = await supabase
    .from('User')
    .select('id, name, email')
    .eq('id', authUser!.id)
    .single()

  return (
    <LayoutClientWrapper user={user}>
      {children}
    </LayoutClientWrapper>
  )
}