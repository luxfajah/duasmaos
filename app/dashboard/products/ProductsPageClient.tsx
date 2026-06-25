'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  duplicateProductTemplate, 
  deleteProductTemplate, 
  createProductTemplate, 
  updateProductMetadata, 
  toggleProductActivation, 
  hardDeleteProductTemplate 
} from './actions'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Copy, 
  Edit3, 
  Trash2, 
  Layers, 
  Layout, 
  DollarSign, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  Archive,
  RotateCcw,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface ProductTemplate {
  id: string
  name: string
  category: string
  type: string
  base_price: number | null
  is_active: boolean
  stages_count: number
  tasks_count: number
}

interface ProductsPageClientProps {
  initialProducts: ProductTemplate[]
}

const CATEGORIES = ['Todos', 'Design', 'Marketing', 'Sociais', 'Web', 'Estratégia']

export function ProductsPageClient({ initialProducts }: ProductsPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Design',
    type: 'service',
    base_price: 0
  })

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductTemplate | null>(null)

  const showInactive = useSearchParams().get('showInactive') === 'true'

  const filtered = initialProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter
    const matchesType = typeFilter === 'all' || p.type === typeFilter
    return matchesSearch && matchesCategory && matchesType
  })

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      try {
        await duplicateProductTemplate(id)
        toast.success('Produto duplicado com sucesso!')
        router.refresh()
      } catch (err) {
        toast.error('Erro ao duplicar produto')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este produto? Ele não aparecerá mais como opção para novos projetos.')) return
    startTransition(async () => {
      try {
        await toggleProductActivation(id, false)
        toast.success('Produto desativado')
        router.refresh()
      } catch (err) {
        toast.error('Erro ao desativar produto')
      }
    })
  }

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      try {
        await toggleProductActivation(id, true)
        toast.success('Produto reativado!')
        router.refresh()
      } catch (err) {
        toast.error('Erro ao reativar produto')
      }
    })
  }

  const handleHardDelete = (id: string) => {
    if (!confirm('AVISO: Esta ação é permanente e excluirá todos os dados do template. Prosseguir?')) return
    startTransition(async () => {
      try {
        await hardDeleteProductTemplate(id)
        toast.success('Produto excluído permanentemente')
        router.refresh()
      } catch (err: any) {
        toast.error(err.message || 'Erro ao excluir produto')
      }
    })
  }

  const handleUpdateMetadata = async () => {
    if (!editingProduct) return
    startTransition(async () => {
      try {
        await updateProductMetadata(editingProduct.id, {
          name: editingProduct.name,
          category: editingProduct.category,
          type: editingProduct.type,
          base_price: editingProduct.base_price
        })
        toast.success('Informações atualizadas!')
        setShowEditModal(false)
        router.refresh()
      } catch (err) {
        toast.error('Erro ao atualizar produto')
      }
    })
  }

  const handleCreateNew = async () => {
    if (!newProduct.name) {
      toast.error('Informe o nome do produto')
      return
    }
    startTransition(async () => {
      try {
        const product = await createProductTemplate(newProduct)
        toast.success('Produto iniciado!')
        setShowNewModal(false)
        router.push(`/dashboard/products/${product.id}/builder`)
      } catch (err) {
        toast.error('Erro ao iniciar produto')
      }
    })
  }

  return (
    <div className="space-y-6">
      
      {/* ── Filters & Search ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input 
              placeholder="Buscar produtos ou categorias..." 
              className="pl-10 h-10 w-full rounded-full transition-all duration-200 glass-pill hover:bg-white/40 dark:hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-brand-primary/30 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="h-10 px-4 glass-pill rounded-full text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 ease-apple"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tipos (Todos)</option>
            <option value="service">Serviço/Único</option>
            <option value="recurring">Recorrente</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.set('showInactive', (!showInactive).toString())
              router.push(`?${params.toString()}`)
            }}
            className={cn(
              "h-10 px-4 rounded-full font-bold transition-all duration-300 ease-apple active:scale-[0.97] border-transparent",
              showInactive ? "glass-pill-active" : "glass-pill text-text-muted hover:text-text-primary hover:bg-white/40 dark:hover:bg-black/40"
            )}
          >
            {showInactive ? <RotateCcw size={16} className="mr-2" /> : <Archive size={16} className="mr-2" />}
            {showInactive ? 'Ver Ativos' : 'Ver Inativos'}
          </Button>
        </div>

        <div className="flex items-center p-1 glass-pill rounded-full overflow-x-auto no-scrollbar w-full lg:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ease-apple select-none whitespace-nowrap",
                categoryFilter === cat 
                  ? "glass-pill-active" 
                  : "text-text-muted hover:text-text-primary hover:bg-white/20 dark:hover:bg-black/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button 
          onClick={() => setShowNewModal(true)}
          className="h-10 px-6 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black shadow-xl shadow-brand-primary/20 flex items-center gap-2 w-full lg:w-auto active:scale-[0.97] transition-all duration-300 ease-apple"
        >
          <Plus size={18} />
          Novo Produto
        </Button>
      </div>

      {/* ── Products Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(product => (
          <div 
            key={product.id}
            className="group relative glass-panel/50 rounded-2xl hover:border-brand-primary/40 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-300 ease-apple active:scale-[0.97] flex flex-col h-[280px]"
          >
            {/* Header / Type Badge */}
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className={cn(
                  "font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border-0",
                  product.type === 'recurring' ? "bg-status-info/10 text-status-info" : "bg-brand-primary/10 text-brand-primary"
                )}>
                  {product.type === 'recurring' ? 'Recorrente' : 'Serviço Único'}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-border bg-surface/90 backdrop-blur-md">
                    <DropdownMenuItem 
                      onClick={() => router.push(`/dashboard/products/${product.id}/builder`)}
                      className="rounded-lg gap-2 cursor-pointer font-bold py-2"
                    >
                      <Edit3 size={14} className="text-brand-primary" /> Editar Pipeline
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingProduct(product)
                        setShowEditModal(true)
                      }}
                      className="rounded-lg gap-2 cursor-pointer font-bold py-2"
                    >
                      <Layout size={14} className="text-status-info" /> Editar Informações
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDuplicate(product.id)}
                      className="rounded-lg gap-2 cursor-pointer font-bold py-2"
                    >
                      <Copy size={14} className="text-brand-primary" /> Duplicar Produto
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push(`/dashboard/projects?templateId=${product.id}`)}
                      className="rounded-lg gap-2 cursor-pointer font-bold py-2"
                    >
                      <Briefcase size={14} className="text-status-success" /> Criar Projeto
                    </DropdownMenuItem>
                    <div className="h-px bg-border/50 my-1" />
                    {product.is_active ? (
                      <DropdownMenuItem 
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg gap-2 cursor-pointer font-bold text-status-danger py-2 hover:bg-status-danger/10"
                      >
                        <Trash2 size={14} /> Desativar
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem 
                          onClick={() => handleReactivate(product.id)}
                          className="rounded-lg gap-2 cursor-pointer font-bold text-status-success py-2 hover:bg-status-success/10"
                        >
                          <RotateCcw size={14} /> Reativar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleHardDelete(product.id)}
                          className="rounded-lg gap-2 cursor-pointer font-bold text-status-danger py-2 hover:bg-status-danger/20"
                        >
                          <ShieldAlert size={14} /> Excluir Permanente
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-lg font-black font-heading text-text-primary mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-4">
                {product.category || 'Geral'}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-muted/60 uppercase">Etapas</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Layers size={12} className="text-brand-primary" />
                    <span className="text-sm font-black">{product.stages_count}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-muted/60 uppercase">Jobs</span>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <CheckCircle2 size={12} className="text-status-success" />
                    <span className="text-sm font-black">{product.tasks_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Footer */}
            <div className="px-5 py-4 bg-surface-muted/30 border-t border-border/40 flex items-center justify-between group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-300 ease-apple">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest group-hover:text-white/60">Investimento Base</span>
                <span className="text-base font-black text-text-primary group-hover:text-white font-mono">
                  {product.base_price !== null && product.base_price !== undefined 
                    ? `R$ ${product.base_price.toLocaleString('pt-BR')}`
                    : 'A definir'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-surface group-hover:bg-white/20 group-hover:text-white"
                onClick={() => router.push(`/dashboard/products/${product.id}/builder`)}
              >
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        ))}

        {/* Empty State / Add Product Card */}
        {filtered.length === 0 && (
          <button 
            onClick={() => setShowNewModal(true)}
            className="h-[280px] rounded-2xl border-2 border-dashed border-border/40 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all duration-300 ease-apple active:scale-[0.97] flex flex-col items-center justify-center gap-3 text-text-muted hover:text-brand-primary"
          >
            <div className="h-12 w-12 rounded-xl bg-border/10 flex items-center justify-center">
              <Plus size={24} />
            </div>
            <span className="text-sm font-black font-heading">Novo Produto</span>
          </button>
        )}
      </div>

      {/* ── New Product Modal ── */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border bg-surface/90 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-heading text-text-primary">Iniciar Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Nome do Produto</label>
              <Input 
                placeholder="Ex: Identidade Visual express" 
                className="h-12 bg-surface/50 border-border/50 rounded-xl"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Categoria</label>
                <select 
                  className="w-full h-12 px-4 bg-surface/50 border border-border/50 rounded-xl text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ease-apple"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                >
                  {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Tipo</label>
                <select 
                  className="w-full h-12 px-4 bg-surface/50 border border-border/50 rounded-xl text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ease-apple"
                  value={newProduct.type}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="service">Serviço / Único</option>
                  <option value="recurring">Recorrente</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNewModal(false)} className="h-11 px-6 rounded-xl font-bold">Cancelar</Button>
            <Button 
              onClick={handleCreateNew} 
              disabled={isPending}
              className="h-11 px-8 rounded-xl bg-brand-primary text-white font-black shadow-xl shadow-brand-primary/20 active:scale-[0.97] transition-all duration-300 ease-apple"
            >
              {isPending ? 'Iniciando...' : 'Iniciar Configuração'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Metadata Modal ── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border bg-surface/90 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-heading text-text-primary">Editar Informações</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Nome do Produto</label>
              <Input 
                placeholder="Ex: Identidade Visual express" 
                className="h-12 bg-surface/50 border-border/50 rounded-xl"
                value={editingProduct?.name || ''}
                onChange={(e) => editingProduct && setEditingProduct({ ...editingProduct, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Categoria</label>
                <select 
                  className="w-full h-12 px-4 bg-surface/50 border border-border/50 rounded-xl text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ease-apple"
                  value={editingProduct?.category || 'Design'}
                  onChange={(e) => editingProduct && setEditingProduct({ ...editingProduct, category: e.target.value })}
                >
                  {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Tipo</label>
                <select 
                  className="w-full h-12 px-4 bg-surface/50 border border-border/50 rounded-xl text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ease-apple"
                  value={editingProduct?.type || 'service'}
                  onChange={(e) => editingProduct && setEditingProduct({ ...editingProduct, type: e.target.value })}
                >
                  <option value="service">Serviço / Único</option>
                  <option value="recurring">Recorrente</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Investimento Base (R$)</label>
              <Input 
                type="number"
                className="h-12 bg-surface/50 border-border/50 rounded-xl font-mono"
                value={editingProduct?.base_price || 0}
                onChange={(e) => editingProduct && setEditingProduct({ ...editingProduct, base_price: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditModal(false)} className="h-11 px-6 rounded-xl font-bold">Cancelar</Button>
            <Button 
              onClick={handleUpdateMetadata} 
              disabled={isPending}
              className="h-11 px-8 rounded-xl bg-brand-primary text-white font-black shadow-xl shadow-brand-primary/20 active:scale-[0.97] transition-all duration-300 ease-apple"
            >
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
