'use client'

import { useState, useEffect } from 'react'
import { loginPortal } from './actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  slug: string
  logoUrl?: string | null
  wallpaperUrl?: string | null
}

export function PortalLoginForm({ slug, logoUrl, wallpaperUrl }: Props) {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Inject wallpaper via CSS variable — avoids styled-jsx dependency
  useEffect(() => {
    if (wallpaperUrl) {
      document.documentElement.style.setProperty('--wallpaper', `url(${wallpaperUrl})`)
    }
    return () => {
      document.documentElement.style.removeProperty('--wallpaper')
    }
  }, [wallpaperUrl])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !pass) {
      setError('Preencha usuário e senha.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const res = await loginPortal(slug, user, pass)
      if (res.success) {
        toast.success('Acesso autorizado!')
        router.refresh()
      } else {
        setError(res.error || 'Erro ao entrar.')
      }
    } catch {
      setError('Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <form className="login-box" onSubmit={handleLogin}>
        {logoUrl && <img src={logoUrl} alt="Logo" />}
        <h2>Acesso ao Painel</h2>
        
        <input 
          type="text" 
          placeholder="Usuário" 
          value={user} 
          onChange={e => setUser(e.target.value)}
          autoComplete="username"
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={pass} 
          onChange={e => setPass(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Validando...' : 'Entrar'}
        </button>
        
        {error && <div className="login-error">{error}</div>}
      </form>
      
      <div className="login-mini-footer">Desenvolvido por Duas Mãos</div>
    </div>
  )
}
