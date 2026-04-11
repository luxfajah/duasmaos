'use client'

import React, { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  MoreVertical, 
  Key, 
  UserMinus, 
  UserX, 
  Link as LinkIcon, 
  Calendar,
  Shield,
  Loader2
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown'
import { resetUserPassword, deleteUser } from '../actions'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UsersSectionProps {
  users: any[]
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  designer: 'Designer',
  writer: 'Redator',
  client: 'Cliente',
}

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  admin: 'default',
  gestor: 'default',
  designer: 'secondary',
  writer: 'secondary',
  client: 'outline',
}

export function UsersSection({ users }: UsersSectionProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  async function handleResetPassword(userId: string) {
    setLoadingAction(userId)
    try {
      const result = await resetUserPassword(userId)
      toast.success(`Senha temporária gerada: ${result.tempPassword}`, {
        duration: 10000,
      })
    } catch (err: any) {
      toast.error(err.message || 'Erro ao resetar senha')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    setLoadingAction(userId)
    try {
      await deleteUser(userId)
      toast.success('Usuário excluído com sucesso')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir usuário')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-up duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-heading text-text-primary">Usuários</h2>
        <p className="text-text-secondary">Gerencie os membros da equipe e acessos de clientes.</p>
      </div>

      <div className="glass overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-surface-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-surface-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={user.full_name} 
                      src={user.avatar_url} 
                      size="sm" 
                      variant="default" 
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary text-sm">{user.full_name}</span>
                      <span className="text-xs text-text-muted">{user.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[user.role] || 'outline'} className="capitalize">
                    {ROLE_LABELS[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-status-success" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-tight">Ativo</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Calendar size={12} />
                    {user.last_login 
                      ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true, locale: ptBR })
                      : 'Nunca'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="size-8 rounded-full border-border/50">
                        {loadingAction === user.id ? <Loader2 size={14} className="animate-spin" /> : <MoreVertical size={14} />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass border-border shadow-xl">
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Gestão de Acesso</div>
                      <DropdownMenuItem onClick={() => handleResetPassword(user.id)} className="gap-2 focus:bg-brand-primary focus:text-white cursor-pointer">
                        <Key size={14} /> Resetar Senha
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 focus:bg-brand-primary focus:text-white cursor-pointer">
                        <LinkIcon size={14} /> Gerar Link de Reset
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Controle</div>
                      <DropdownMenuItem className="gap-2 focus:bg-status-danger focus:text-white cursor-pointer">
                        <UserMinus size={14} /> Desativar Usuário
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="gap-2 text-status-danger focus:bg-status-danger focus:text-white cursor-pointer">
                        <UserX size={14} /> Excluir Usuário
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
