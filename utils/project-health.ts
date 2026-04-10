import { Task, ProjectStage } from '@/types/database';
import { PROJECT_TEMPLATES } from './project-templates';

/**
 * Ensures a stage uses the predefined weight from its template,
 * or dynamically averages it if it's not strictly mapped.
 */
export function getStageWeight(stage: ProjectStage, projectType: string | null): number {
  if (!projectType || !(projectType in PROJECT_TEMPLATES)) {
    // Basic fallback logic for unmapped types
    return 10;
  }
  const template = PROJECT_TEMPLATES[projectType as keyof typeof PROJECT_TEMPLATES];
  const mapped = template.find(t => t.name === stage.name);
  if (mapped && mapped.weight !== undefined) {
    return mapped.weight;
  }
  return 10; // basic fallback
}

/**
 * Calculates raw completion progress (0-100) based on weighted stages holding tasks.
 */
export function calculateProjectProgress(stages: ProjectStage[], tasks: Task[], projectType: string | null): number {
  if (!stages.length) return 0;
  if (!tasks.length) return 0; // if we have templates but no tasks started yet, assuming 0?

  // First we normalize the total available weights.
  // We only count stages that the project template expects, 
  // ensuring the sum of all template weights = 100%. 
  
  // Calculate completion per stage
  let accumulatedProgress = 0;
  let totalWeightsTarget = 0; // usually 100 for our templates
  
  // If the DB creates stages properly, we iterate them.
  stages.forEach(stage => {
    const weight = getStageWeight(stage, projectType);
    totalWeightsTarget += weight;

    // Filter tasks for this stage
    const stageTasks = tasks.filter(t => t.stage_id === stage.id);
    if (stageTasks.length === 0) {
      // If a stage has no tasks but is marked as 'completed' in DB, we give it full weight.
      // Else 0.
      if (stage.completed) accumulatedProgress += (weight * 1);
      return; 
    }

    const completedCount = stageTasks.filter(t => t.status === 'done').length;
    const stageProgressRatio = completedCount / stageTasks.length; // e.g. 0.5 for 50%
    
    accumulatedProgress += (weight * stageProgressRatio);
  });

  if (totalWeightsTarget === 0) return 0;
  
  const rawProgress = Math.round((accumulatedProgress / totalWeightsTarget) * 100);
  return Math.min(Math.max(rawProgress, 0), 100);
}

/**
 * Activity score based on Recency strictly using updated_at.
 */
function calculateActivityScore(tasks: Task[]): number {
  if (!tasks.length) return 10; // no tasks = low activity

  const now = new Date().getTime();
  let mostRecent = 0;
  
  for (const t of tasks) {
    const d = new Date(t.updated_at).getTime();
    if (d > mostRecent) mostRecent = d;
  }

  const msInDay = 1000 * 60 * 60 * 24;
  const daysAgo = (now - mostRecent) / msInDay;

  if (daysAgo <= 1) return 100;
  if (daysAgo <= 3) return 80;
  if (daysAgo <= 7) return 60;
  if (daysAgo <= 14) return 40;
  return 10;
}

/**
 * Deadline score calculation
 */
function calculateDeadlineScore(projectDeadline: string | null, tasks: Task[]): number {
  // if no deadlines at all, we consider it healthy enough (neutral)
  if (!projectDeadline && !tasks.some(t => t.deadline)) return 80;

  const now = new Date().getTime();
  
  // Check project deadline
  if (projectDeadline) {
    const pDl = new Date(projectDeadline).getTime();
    if (pDl < now) {
      // overdue project
      return 20; 
    }
  }

  // Check tasks deadline
  const incompleteTasksWithDeadline = tasks.filter(t => t.status !== 'done' && t.deadline);
  let overdueTasksCount = 0;

  for (const t of incompleteTasksWithDeadline) {
    if (new Date(t.deadline!).getTime() < now) overdueTasksCount++;
  }

  if (overdueTasksCount === 0) return 100;
  if (overdueTasksCount <= 2) return 60;
  return 30; // many overdue
}
  
/**
 * Blocker score calculation
 */
function calculateBlockerScore(tasks: Task[]): number {
  // Review status might indicate waiting on client, or blocked.
  if (!tasks.length) return 100;

  const inReviewOrBlockedCount = tasks.filter(t => t.status === 'review').length;
  
  if (inReviewOrBlockedCount === 0) return 100;
  if (inReviewOrBlockedCount === 1) return 80;
  if (inReviewOrBlockedCount <= 3) return 50;
  
  return 20;
}

/**
 * Calculate Global Project Health Score (0-100)
 */
export function calculateHealthScore(
  progress: number, 
  projectDeadline: string | null, 
  tasks: Task[]
): number {
  const deadlineScore = calculateDeadlineScore(projectDeadline, tasks);
  const activityScore = calculateActivityScore(tasks);
  const blockerScore = calculateBlockerScore(tasks);

  // formula: (progress * 0.4) + (deadline_score * 0.3) + (activity_score * 0.2) + (blocker_score * 0.1)
  const healthScore = 
    (progress * 0.4) + 
    (deadlineScore * 0.3) + 
    (activityScore * 0.2) + 
    (blockerScore * 0.1);

  return Math.round(Math.min(Math.max(healthScore, 0), 100));
}
