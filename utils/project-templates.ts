import { ProjectType } from '@/types/database';

export const PROJECT_TEMPLATES: Record<ProjectType, { name: string; weight: number }[]> = {
  redes_sociais: [
    { name: 'Alinhamento', weight: 5 },
    { name: 'Copywriting', weight: 15 },
    { name: 'Revisão de Copy', weight: 5 },
    { name: 'Copy Aprovada', weight: 5 },
    { name: 'Design', weight: 30 },
    { name: 'Revisão de Design', weight: 10 },
    { name: 'Ajustes de Design', weight: 10 },
    { name: 'Aprovação Final', weight: 10 },
    { name: 'Entrega', weight: 10 },
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
    { name: 'Apresentação Final', weight: 5 },
    { name: 'Revisão Opcional', weight: 0 },
    { name: 'Entrega', weight: 5 },
  ],
  site: [
    { name: 'Alinhamento', weight: 5 },
    { name: 'Coleta de Conteúdo', weight: 15 },
    { name: 'Arquitetura', weight: 15 },
    { name: 'Desenvolvimento', weight: 40 },
    { name: 'Revisão Interna', weight: 5 },
    { name: 'Revisão do Cliente', weight: 10 },
    { name: 'Ajustes', weight: 5 },
    { name: 'Entrega', weight: 5 },
  ],
};
