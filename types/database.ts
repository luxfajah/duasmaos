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
  stage_id: string | null;
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

export const TASK_STATUS_V2_LABELS: Record<TaskStatusV2, string> = {
  locked: 'Bloqueado',
  pending: 'Pendente',
  in_progress: 'Em andamento',
  in_review: 'Em revisão',
  approved: 'Aprovado',
  done: 'Concluído',
  blocked: 'Pausado/Impedido',
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

// ── V2 Workflow System ─────────────────────────────────────────────────────

export type WorkflowTypeV2 = 'branding' | 'social_media' | 'website';
export type StageStatusV2 = 'pending' | 'in_progress' | 'waiting_approval' | 'approved' | 'done';
export type TaskStatusV2 = 'locked' | 'pending' | 'in_progress' | 'in_review' | 'approved' | 'done' | 'blocked';
export type ProjectStatusV2 = 'active' | 'paused' | 'completed' | 'archived';
export type TaskPriorityV2 = 'low' | 'medium' | 'high' | 'urgent';
export type TaskTypeV2 = 'task' | 'meeting' | 'review' | 'approval';
export type PostTypeV2 = 'feed' | 'story' | 'carousel' | 'video_story' | 'reels';
export type PostStatusV2 = 'pending' | 'in_progress' | 'done';
export type ApprovalStatusV2 = 'pending' | 'approved' | 'rejected';
export type DeliverableTypeV2 = 'copy' | 'design' | 'strategy' | 'website' | 'social_copy' | 'social_design' | 'default';

export interface V2Workspace {
  id: string;
  name: string;
  owner_id: string;
  slug: string | null;
  created_at: string;
}

export interface V2Project {
  id: string;
  workspace_id: string;
  client_id: string;
  name: string;
  workflow_type: WorkflowTypeV2;
  status: ProjectStatusV2;
  priority: TaskPriorityV2 | null;
  owner_id: string | null;
  type: 'one_time' | 'recurring';
  amount: number | null;
  billing_day: number | null;
  auto_restart: boolean;
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface V2ProjectStage {
  id: string;
  project_id: string;
  name: string;
  stage_key: string;
  order: number;
  status: StageStatusV2;
  requires_approval: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface V2Task {
  id: string;
  project_id: string;
  stage_id: string;
  title: string;
  description: string | null;
  type: TaskTypeV2;
  deliverable_type: DeliverableTypeV2 | null;
  status: TaskStatusV2;
  priority: TaskPriorityV2;
  order: number | null;
  stage_order: number | null;
  depends_on_task_id: string | null;
  due_date: string | null;
  social_post_count?: number;
  parent_task_id?: string | null;
  /** Populated via v2_task_assignees join or direct column if migrated */
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
}

export interface V2SocialPost {
  id: string;
  task_id: string;
  type: PostTypeV2;
  status: PostStatusV2;
  approval_status: ApprovalStatusV2;
  carousel_slides: number;
  caption: string | null;
  hashtags: string[];
  optional_text: string | null;
  media: any[]; // Array of media objects
  order: number;
  started_at: string | null;
  completed_at: string | null;
  inherits_from_post_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface V2TaskAssignee {
  id: string;
  task_id: string;
  user_id: string;
}

export interface V2StageTemplate {
  id: string;
  workflow_type: WorkflowTypeV2;
  name: string;
  stage_key: string;
  order: number;
  requires_approval: boolean;
}

export interface V2TaskTemplate {
  id: string;
  workflow_type: WorkflowTypeV2;
  stage_key: string;
  title: string;
  type: TaskTypeV2;
  deliverable_type: DeliverableTypeV2 | null;
  order: number | null;
}

export interface V2StageApproval {
  id: string;
  stage_id: string;
  approved_by: string;
  approved_at: string | null;
  status: ApprovalStatusV2;
}


export interface V2TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// ── Shared relation types ────────────────────────────────────────────────────

/** V2Task enriched with joined project and profile data. Used across TasksTable, TaskKanban, TaskModal and TasksPageClient. */
export type TaskWithRelations = V2Task & {
  projects: { name: string; client_id: string; clients: { name: string } | null } | null
  profiles: { full_name: string } | null
  /** Alias kept for legacy fallback components that read task.deadline */
  deadline?: string | null
}

/** V2Project enriched for Kanban display (includes client name, optional profile, and legacy fields used by KanbanCard). */
export type KanbanProject = V2Project & {
  clients: { name: string } | null
  profiles: { full_name: string; avatar_url?: string | null } | null
  /** Legacy field — not present on V2Project but may be populated by query joins */
  deadline?: string | null
  priority?: string | null
}



// ── Product Templates & Finance (V3 Expansion) ──────────────────────────────

export interface ProductTemplate {
  id: string;
  name: string;
  category: string | null;
  base_price: number | null;
  type: string;
  is_active: boolean;
  created_at: string;
  stages_count?: number;
  tasks_count?: number;
}

export interface ProductTemplateStage {
  id: string;
  template_id: string;
  name: string;
  order_index: number;
  duration_days: number;
  auto_start: boolean;
  created_at: string;
}

export interface ProductTemplateTask {
  id: string;
  stage_id: string;
  title: string;
  role: string | null;
  deadline_offset: number;
  task_type: string;
  is_required: boolean;
  created_at: string;
}

export type RevenueStatus = 'pending' | 'paid' | 'overdue';
export type PaymentType = 'one_time' | 'installment' | 'recurring';
export type RecurrenceFrequency = 'monthly' | 'weekly' | 'custom';

export interface Revenue {
  id: string;
  project_id: string;
  amount: number;
  due_date: string;
  status: RevenueStatus;
  type: PaymentType;
  created_at: string;
}

export interface RevenueRecurrence {
  id: string;
  project_id: string;
  amount: number;
  frequency: RecurrenceFrequency;
  billing_day: number | null;
  next_due_date: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  revenue_id: string;
  paid_at: string;
  amount: number;
  method: string;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  type: 'contract' | 'briefing' | 'other';
  file_url: string;
  uploaded_at: string;
}
