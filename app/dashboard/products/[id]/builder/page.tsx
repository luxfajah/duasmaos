import { getProductTemplateById } from '../../actions'
import { ProductTemplateBuilder } from '@/components/products/ProductTemplateBuilder'

interface BuilderPageProps {
  params: {
    id: string
  }
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const template = await getProductTemplateById(params.id)

  return (
    <div className="animate-in fade-in duration-500">
      <ProductTemplateBuilder initialData={template} id={params.id} />
    </div>
  )
}
