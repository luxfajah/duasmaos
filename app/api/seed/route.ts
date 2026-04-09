import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  const email = 'diretoria@duasmaos.com'
  const password = 'duasmaos123' 
  const fullName = 'Diretoria Duas Mãos'

  // Tentar criar o usuário
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'admin'
      }
    }
  })

  if (error) {
    // Se o usuário já existir, este erro pode ocorrer. Vamos tentar retornar algo útil.
    return NextResponse.json({ 
      error: error.message, 
      details: 'Se o erro for "User already registered", tente logar com a senha duasmaos123 ou admin_duas_maos.' 
    }, { status: 400 })
  }

  return NextResponse.json({ 
    message: 'Usuário Admin criado com sucesso!', 
    email: email,
    password: password,
    steps: [
      '1. Tente logar com os dados acima.',
      '2. Se der erro de senha, pode ser que o usuário já existisse com a senha anterior (admin_duas_maos).',
      '3. Certifique-se de que o "Confirm Email" está desligado no Dashboard do Supabase (Authentication > Settings).'
    ]
  })
}
