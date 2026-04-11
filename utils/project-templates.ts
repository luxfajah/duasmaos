import { WorkflowTypeV2 } from '@/types/database';

export const PROJECT_TEMPLATES: Record<WorkflowTypeV2, { name: string; weight: number }[]> = {
  social_media: [
    { name: 'Planejamento', weight: 10 },
    { name: 'Copywriting', weight: 25 },
    { name: 'Design', weight: 40 },
    { name: 'Publicação', weight: 25 },
  ],
  branding: [
    { name: 'Alinhamento', weight: 5 },
    { name: 'Pesquisa de Mercado', weight: 15 },
    { name: 'Estratégia de Marca', weight: 10 },
    { name: 'Identidade V1', weight: 20 },
    { name: 'Identidade V2', weight: 10 },
    { name: 'Revisão Interna', weight: 5 },
    { name: 'Seleção do Cliente', weight: 10 },
    { name: 'Manual da Marca', weight: 15 },
    { name: 'Entrega', weight: 10 },
  ],
  website: [
    { name: 'Alinhamento', weight: 5 },
    { name: 'Coleta de Conteúdo', weight: 15 },
    { name: 'Arquitetura', weight: 15 },
    { name: 'Desenvolvimento', weight: 40 },
    { name: 'Revisão do Cliente', weight: 15 },
    { name: 'Entrega', weight: 10 },
  ],
};
