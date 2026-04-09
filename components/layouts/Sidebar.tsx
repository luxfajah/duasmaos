import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("flex flex-col w-64 border-r border-border bg-surface h-screen sticky top-0 px-6 py-8", className)}>
      <div className="mb-12 flex items-center gap-2">
         <div className="w-6 h-6 bg-brand-primary"></div>
         <span className="font-serif font-bold text-xl tracking-tight text-text-primary">Duas Mãos</span>
      </div>
      
      <nav className="flex-1 space-y-8">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-4">Aprova</p>
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 -mx-3 rounded-md hover:bg-surface-muted/50 text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
                Mesa de Trabalho
              </Link>
            </li>
            <li>
              <Link href="/dashboard/posts" className="flex items-center gap-3 px-3 py-2 -mx-3 rounded-md hover:bg-surface-muted/50 text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
                Lista de Pautas
              </Link>
            </li>
            <li>
              <Link href="/dashboard/calendar" className="flex items-center gap-3 px-3 py-2 -mx-3 rounded-md hover:bg-surface-muted/50 text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
                Calendário Editorial
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-4">Ajustes</p>
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard/clients" className="flex items-center gap-3 px-3 py-2 -mx-3 rounded-md hover:bg-surface-muted/50 text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
                Marcas / Clientes
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="mt-auto border-t border-border pt-6 -mx-6 px-6">
        <form action="/auth/signout" method="post">
          <Button variant="ghost" className="w-full justify-start text-text-secondary hover:text-danger hover:bg-danger/10 px-3 -ml-3">
            Sair do sistema
          </Button>
        </form>
      </div>
    </aside>
  );
}
