import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  FileStack,
  FileText,
  Package,
  TrendingUp,
  Settings2,
  type LucideIcon,
} from 'lucide-react'

export const navGroups: { label: string; items: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] }[] = [
  {
    label: 'Operação',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/clients', label: 'Clientes', icon: Users, exact: true },
      { href: '/dashboard/projects', label: 'Projetos', icon: FolderKanban },
      { href: '/dashboard/tasks', label: 'Tarefas', icon: CheckSquare },
    ],
  },
  {
    label: 'Produção',
    items: [
      { href: '/dashboard/calendar', label: 'Calendário', icon: CalendarDays },
      { href: '/dashboard/files', label: 'Arquivos', icon: FileStack },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/dashboard/propostas', label: 'Propostas', icon: FileText },
      { href: '/dashboard/products', label: 'Produtos', icon: Package },
    ],
  },
  {
    label: 'Administrativo',
    items: [
      { href: '/dashboard/financeiro', label: 'Financeiro', icon: TrendingUp },
      { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings2 },
    ],
  },
]
