export const dynamic = "force-dynamic";
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  // Como as tabelas têm RLS, pode ser que retornem vazio se não estivermos logados.
  // Mas vamos tentar listar os perfis públicos (se o RLS permitir leitura anônima ou se as políticas permitirem).
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')

  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')

  return NextResponse.json({ 
    profiles, 
    profileError: profileError?.message,
    clients,
    clientError: clientError?.message,
    notice: 'Se profiles vier vazio e profileError for null, é por causa do RLS (Row Level Security).'
  })
}
