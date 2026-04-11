import { getProductTemplates } from './actions'
import { ProductsPageClient } from './ProductsPageClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export const metadata = {
  title: 'Produtos — Duas Mãos',
  description: 'Gerencie templates de produtos e pipelines de entrega.',
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { showInactive?: string }
}) {
  const showInactive = searchParams.showInactive === 'true'
  const products = await getProductTemplates(showInactive)

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader 
        title="Produtos" 
        subtitle={`${products.length} template${products.length !== 1 ? 's' : ''} de serviço configurados`} 
      />
      <ProductsPageClient initialProducts={products} />
    </div>
  )
}
