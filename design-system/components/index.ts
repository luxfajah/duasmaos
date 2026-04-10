/**
 * Design System – Components Index
 * Duas Mãos
 *
 * Re-exporta todos os componentes UI do design system.
 * Inclui primitivos (ui/) e padrões de interface (patterns/).
 */

// Primitivos UI
export { Button, buttonVariants } from '@/components/ui/button'
export { Badge, badgeVariants } from '@/components/ui/badge'
export { Input, InputField } from '@/components/ui/input'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card'
export { Avatar, AvatarGroup } from '@/components/ui/avatar'
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown'
export { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, useModal } from '@/components/ui/modal'

// Padrões de interface
export { ProjectCard } from '@/components/patterns/ProjectCard'
export { ClientCard } from '@/components/patterns/ClientCard'
export { KanbanCard } from '@/components/patterns/KanbanCard'
export { DashboardWidget } from '@/components/patterns/DashboardWidget'

// Layout
export { Sidebar } from '@/components/layouts/Sidebar'
export { Header, ContentWrapper } from '@/components/layouts/Header'
