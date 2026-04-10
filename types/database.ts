export type UserRole = 'admin' | 'gestor' | 'writer' | 'designer' | 'client';

export type PostStatus =
  | 'draft'
  | 'copy_review'
  | 'copy_rejected'
  | 'design_draft'
  | 'design_review'
  | 'design_rejected'
  | 'approved';

export type ProjectStatus = 'draft' | 'copy' | 'review' | 'approved' | 'delayed' | 'completed';
export type ProjectType = 'redes_sociais' | 'branding' | 'site';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type ClientStatus = 'active' | 'inactive' | 'paused';
export type PipelineStage = 'Lead' | 'Diagnóstico' | 'Proposta' | 'Negociação' | 'Fechado' | 'Onboarding';
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  client_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string | null;
  created_at: string;
}

export interface ClientContact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  pipeline_stage: PipelineStage | null;
  notes: string | null;
  website: string | null;
  sector: string | null;
  contacts: ClientContact[];
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  type: ProjectType | null;
  status: ProjectStatus;
  priority: Priority;
  deadline: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStage {
  id: string;
  project_id: string;
  name: string;
  position: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  priority: Priority;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string | null;
  body: string;
  pos_x: number | null;
  pos_y: number | null;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  client_id: string;
  title: string;
  status: PostStatus;
  publish_date: string | null;
  copy_content: string | null;
  design_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostVersion {
  id: string;
  post_id: string;
  stage: 'copy' | 'design';
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  stage: 'copy' | 'design';
  text: string;
  pos_x: number | null;
  pos_y: number | null;
  created_at: string;
}

// ── Label helpers ──────────────────────────────────────────────────────────

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  redes_sociais: 'Redes Sociais',
  branding: 'Branding',
  site: 'Site',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Rascunho',
  copy: 'Copy',
  review: 'Revisão',
  approved: 'Aprovado',
  delayed: 'Atrasado',
  completed: 'Concluído',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  review: 'Em revisão',
  done: 'Concluído',
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  paused: 'Pausado',
};

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  Lead: 'Lead',
  'Diagnóstico': 'Diagnóstico',
  Proposta: 'Proposta',
  'Negociação': 'Negociação',
  Fechado: 'Fechado',
  Onboarding: 'Onboarding',
};
