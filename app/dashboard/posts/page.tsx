import Link from "next/link";
import { EditorialHeader } from "@/components/brand/EditorialHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/brand/StatusPill";
import { Button } from "@/components/ui/button";
import { getPosts } from "../actions";

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-16 animate-in fade-in-50 duration-500">
      <EditorialHeader 
        title="Lista de Pautas" 
        subtitle="Gerencie de ponta a ponta os conteudos da sua base operacional."
      />
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <Table>
          <TableHeader className="bg-surface-muted">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[45%] text-[10px] uppercase tracking-widest font-bold text-text-secondary py-6">Pauta Central</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Cliente</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Cronograma</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Decisão (Status)</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold text-text-secondary">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post.id} className="cursor-pointer hover:bg-surface-muted/50 transition-colors">
                <TableCell className="font-serif font-medium text-lg text-text-primary py-6">{post.title}</TableCell>
                <TableCell className="text-sm font-medium text-text-secondary">{post.clients?.name}</TableCell>
                <TableCell className="text-sm font-mono text-text-muted">
                  {post.publish_date ? new Date(post.publish_date).toLocaleDateString('pt-BR') : 'Sem data'}
                </TableCell>
                <TableCell><StatusPill status={post.status} /></TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/posts/${post.id}`}>
                    <Button variant="outline" size="sm">Abrir Pauta</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-text-muted">Nenhuma pauta encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
