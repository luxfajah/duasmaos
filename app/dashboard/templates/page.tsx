import { ProductTemplateBuilder } from '@/components/templates/ProductTemplateBuilder'

export const metadata = {
  title: 'Template Builder — Duas Mãos',
  description: 'Crie templates de produtos reutilizáveis com pipelines e tarefas.',
}

export default function TemplatesPage() {
  return <ProductTemplateBuilder />
}
