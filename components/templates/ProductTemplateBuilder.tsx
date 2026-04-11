'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskType = 'task' | 'checklist' | 'approval'
type ProductType = 'service' | 'recurring' | 'sprint'

interface TaskTemplate {
  id: string
  name: string
  role: string
  deadline: string
  type: TaskType
  required: boolean
}

interface Stage {
  id: string
  name: string
  duration: number
  autoStart: boolean
  tasks: TaskTemplate[]
}

interface Rules {
  autoStartNext: boolean
  bufferDays: number
  repeatOnRevision: boolean
  clientParticipation: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  task: 'Tarefa',
  checklist: 'Checklist',
  approval: 'Aprovação',
}

const TASK_TYPE_COLORS: Record<TaskType, string> = {
  task: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  checklist: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  approval: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  service: 'Serviço',
  recurring: 'Recorrente',
  sprint: 'Sprint',
}

const ROLES = ['Redator', 'Design', 'Estrategista', 'Gestor', 'Cliente', 'Dev', 'Social Media']

const DEFAULT_STAGES: Stage[] = [
  {
    id: uid(),
    name: 'Briefing',
    duration: 2,
    autoStart: true,
    tasks: [
      { id: uid(), name: 'Coletar briefing do cliente', role: 'Gestor', deadline: 'D+1', type: 'task', required: true },
      { id: uid(), name: 'Aprovação de escopo', role: 'Cliente', deadline: 'D+2', type: 'approval', required: true },
    ],
  },
  {
    id: uid(),
    name: 'Produção',
    duration: 5,
    autoStart: false,
    tasks: [
      { id: uid(), name: 'Redação dos textos', role: 'Redator', deadline: 'D+3', type: 'task', required: true },
      { id: uid(), name: 'Checklist de qualidade', role: 'Gestor', deadline: 'D+5', type: 'checklist', required: false },
    ],
  },
  {
    id: uid(),
    name: 'Revisão',
    duration: 3,
    autoStart: false,
    tasks: [
      { id: uid(), name: 'Revisão interna', role: 'Gestor', deadline: 'D+1', type: 'task', required: true },
      { id: uid(), name: 'Aprovação final cliente', role: 'Cliente', deadline: 'D+3', type: 'approval', required: true },
    ],
  },
  {
    id: uid(),
    name: 'Entrega',
    duration: 1,
    autoStart: true,
    tasks: [
      { id: uid(), name: 'Publicar / Entregar', role: 'Social Media', deadline: 'D+1', type: 'task', required: true },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-xl',
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]',
        className
      )}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[hsl(13_55%_56%)] to-[hsl(43_85%_65%)] shrink-0" />
      <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/40 font-body">
        {children}
      </span>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-all duration-200 focus-visible:outline-none',
        checked
          ? 'bg-[hsl(13_52%_56%)] shadow-[0_0_10px_hsl(13_52%_56%/0.5)]'
          : 'bg-white/10'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg',
          'transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function IconButton({
  onClick,
  title,
  children,
  variant = 'ghost',
}: {
  onClick: () => void
  title?: string
  children: React.ReactNode
  variant?: 'ghost' | 'danger' | 'brand'
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150',
        variant === 'ghost' && 'text-white/30 hover:text-white/80 hover:bg-white/08',
        variant === 'danger' && 'text-red-400/50 hover:text-red-400 hover:bg-red-500/10',
        variant === 'brand' && 'text-[hsl(13_52%_56%)] hover:bg-[hsl(13_52%_56%/0.1)]'
      )}
    >
      {children}
    </button>
  )
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onChange,
  onRemove,
}: {
  task: TaskTemplate
  onChange: (t: TaskTemplate) => void
  onRemove: () => void
}) {
  return (
    <div className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-colors duration-150">
      {/* drag handle */}
      <span className="text-white/20 cursor-grab active:cursor-grabbing shrink-0">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
          <circle cx="4" cy="4" r="1.5" /><circle cx="8" cy="4" r="1.5" />
          <circle cx="4" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
          <circle cx="4" cy="12" r="1.5" /><circle cx="8" cy="12" r="1.5" />
        </svg>
      </span>

      {/* Name */}
      <input
        value={task.name}
        onChange={(e) => onChange({ ...task, name: e.target.value })}
        placeholder="Nome da tarefa…"
        className="flex-1 min-w-0 bg-transparent text-sm text-white/90 placeholder:text-white/25 outline-none"
      />

      {/* Role */}
      <select
        value={task.role}
        onChange={(e) => onChange({ ...task, role: e.target.value })}
        className="bg-white/[0.05] border border-white/[0.07] rounded-lg text-xs text-white/70 px-2 py-1 outline-none cursor-pointer hover:border-white/20 transition-colors w-28"
      >
        {ROLES.map((r) => (
          <option key={r} value={r} className="bg-[#0f1629] text-white">{r}</option>
        ))}
      </select>

      {/* Deadline */}
      <input
        value={task.deadline}
        onChange={(e) => onChange({ ...task, deadline: e.target.value })}
        placeholder="D+1"
        className="w-14 bg-white/[0.05] border border-white/[0.07] rounded-lg text-xs text-amber-400 placeholder:text-white/25 px-2 py-1 text-center outline-none font-mono hover:border-white/20 transition-colors"
      />

      {/* Type */}
      <select
        value={task.type}
        onChange={(e) => onChange({ ...task, type: e.target.value as TaskType })}
        className={cn(
          'rounded-lg border text-xs px-2 py-1 outline-none cursor-pointer transition-colors w-24',
          TASK_TYPE_COLORS[task.type],
          'bg-transparent'
        )}
      >
        {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((t) => (
          <option key={t} value={t} className="bg-[#0f1629] text-white">{TASK_TYPE_LABELS[t]}</option>
        ))}
      </select>

      {/* Required toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-white/30 hidden sm:block">Req.</span>
        <Toggle checked={task.required} onChange={(v) => onChange({ ...task, required: v })} />
      </div>

      {/* Remove */}
      <IconButton onClick={onRemove} title="Remover tarefa" variant="danger">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </IconButton>
    </div>
  )
}

// ─── StageCard ────────────────────────────────────────────────────────────────

function StageCard({
  stage,
  index,
  total,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: {
  stage: Stage
  index: number
  total: number
  isSelected: boolean
  onSelect: () => void
  onUpdate: (s: Stage) => void
  onRemove: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}) {
  const addTask = () => {
    const newTask: TaskTemplate = {
      id: uid(),
      name: '',
      role: ROLES[0],
      deadline: `D+${stage.tasks.length + 1}`,
      type: 'task',
      required: false,
    }
    onUpdate({ ...stage, tasks: [...stage.tasks, newTask] })
  }

  const updateTask = (taskId: string, updated: TaskTemplate) => {
    onUpdate({ ...stage, tasks: stage.tasks.map((t) => (t.id === taskId ? updated : t)) })
  }

  const removeTask = (taskId: string) => {
    onUpdate({ ...stage, tasks: stage.tasks.filter((t) => t.id !== taskId) })
  }

  return (
    <div
      className={cn(
        'relative flex-shrink-0 w-[340px] rounded-2xl border transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-[hsl(13_52%_56%/0.5)] bg-white/[0.06] shadow-[0_0_0_1px_hsl(13_52%_56%/0.2),0_8px_32px_-4px_rgba(0,0,0,0.4)]'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]'
      )}
      onClick={onSelect}
    >
      {/* Stage number indicator */}
      <div className={cn(
        'absolute -top-3 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
        isSelected
          ? 'bg-[hsl(13_52%_56%)] text-white shadow-[0_0_12px_hsl(13_52%_56%/0.6)]'
          : 'bg-white/[0.1] text-white/50'
      )}>
        {index + 1}
      </div>

      {/* Connector line to next stage */}
      {index < total - 1 && (
        <div className="absolute top-1/2 -right-5 w-5 h-px bg-gradient-to-r from-white/20 to-transparent z-10 pointer-events-none" />
      )}

      <div className="p-4 pt-5">
        {/* Stage header */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <input
            value={stage.name}
            onChange={(e) => onUpdate({ ...stage, name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="Nome da etapa…"
            className="flex-1 bg-transparent font-heading font-bold text-base text-white placeholder:text-white/25 outline-none border-b border-transparent focus:border-white/20 transition-colors pb-0.5"
          />
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <IconButton onClick={onMoveLeft} title="Mover para esquerda" variant="ghost" >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </IconButton>
            <IconButton onClick={onMoveRight} title="Mover para direita" variant="ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </IconButton>
            <IconButton onClick={onRemove} title="Remover etapa" variant="danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </IconButton>
          </div>
        </div>

        {/* Duration & Auto-start */}
        <div className="flex items-center gap-3 mb-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.07]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40 shrink-0">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <input
              type="number"
              min={1}
              value={stage.duration}
              onChange={(e) => onUpdate({ ...stage, duration: Number(e.target.value) })}
              className="w-8 bg-transparent text-xs text-white/80 outline-none text-center"
            />
            <span className="text-[10px] text-white/30">dias</span>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Toggle
              checked={stage.autoStart}
              onChange={(v) => onUpdate({ ...stage, autoStart: v })}
            />
            <span className="text-[11px] text-white/50">
              {stage.autoStart ? 'Início automático' : 'Início manual'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.05] mb-3" />

        {/* Tasks */}
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {stage.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onChange={(updated) => updateTask(task.id, updated)}
              onRemove={() => removeTask(task.id)}
            />
          ))}
          <button
            type="button"
            onClick={addTask}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/[0.1] text-white/30 hover:text-white/60 hover:border-white/25 transition-all duration-150 text-xs"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar tarefa
          </button>
        </div>

        {/* Task count badge */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-white/40 border border-white/[0.05]">
            {stage.tasks.length} {stage.tasks.length === 1 ? 'tarefa' : 'tarefas'}
          </div>
          {stage.tasks.some((t) => t.type === 'approval') && (
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] text-emerald-400 border border-emerald-500/20">
              aprovação
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Preview Panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ stages, rules }: { stages: Stage[]; rules: Rules }) {
  let dayOffset = 0
  const stageTimeline = stages.map((stage, i) => {
    const start = dayOffset + (i > 0 ? rules.bufferDays : 0)
    dayOffset = start + stage.duration
    return { stage, start, end: start + stage.duration }
  })

  const totalDays = stageTimeline[stageTimeline.length - 1]?.end ?? 0
  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0)
  const requiredTasks = stages.reduce((acc, s) => acc + s.tasks.filter((t) => t.required).length, 0)

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Etapas', value: stages.length, color: 'text-[hsl(13_52%_56%)]' },
          { label: 'Tarefas', value: totalTasks, color: 'text-amber-400' },
          { label: 'Duração', value: `${totalDays}d`, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
            <div className={cn('text-xl font-bold font-heading', color)}>{value}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {stageTimeline.map(({ stage, start, end }, i) => {
          const pct = totalDays > 0 ? (stage.duration / totalDays) * 100 : 100
          const offset = totalDays > 0 ? (start / totalDays) * 100 : 0

          return (
            <div key={stage.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${(i * 37 + 200) % 360} 60% 60%)` }} />
                  <span className="text-xs text-white/70 font-medium">{stage.name || `Etapa ${i + 1}`}</span>
                </div>
                <span className="text-[10px] text-white/35 font-mono">D{start}–D{end}</span>
              </div>
              <div className="relative h-5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.05]">
                <div
                  className="absolute top-0 h-full rounded-full flex items-center px-2 transition-all duration-500"
                  style={{
                    left: `${offset}%`,
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, hsl(${(i * 37 + 200) % 360} 55% 40%) 0%, hsl(${(i * 37 + 220) % 360} 50% 50%) 100%)`,
                    minWidth: '32px',
                  }}
                >
                  <span className="text-[9px] text-white/90 font-bold whitespace-nowrap overflow-hidden">
                    {stage.duration}d
                  </span>
                </div>
                {/* Buffer indicator */}
                {rules.bufferDays > 0 && i > 0 && (
                  <div
                    className="absolute top-0 h-full bg-white/[0.05] border-l border-r border-white/[0.1] transition-all duration-500"
                    style={{
                      left: `${(start - rules.bufferDays) / totalDays * 100}%`,
                      width: `${rules.bufferDays / totalDays * 100}%`,
                    }}
                  />
                )}
              </div>
              {/* Tasks under each stage */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {stage.tasks.map((task) => (
                  <span
                    key={task.id}
                    className={cn('text-[9px] px-1.5 py-0.5 rounded border', TASK_TYPE_COLORS[task.type])}
                  >
                    {task.name || 'Tarefa'}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Resumo</p>
        <div className="space-y-1.5 text-xs text-white/60">
          <div className="flex justify-between">
            <span>Tarefas obrigatórias</span>
            <span className="text-white/90 font-medium">{requiredTasks} / {totalTasks}</span>
          </div>
          <div className="flex justify-between">
            <span>Início automático</span>
            <span className="text-white/90 font-medium">{stages.filter(s => s.autoStart).length} etapas</span>
          </div>
          {rules.bufferDays > 0 && (
            <div className="flex justify-between">
              <span>Buffer entre etapas</span>
              <span className="text-amber-400 font-medium">+{rules.bufferDays}d por etapa</span>
            </div>
          )}
          {rules.clientParticipation && (
            <div className="flex justify-between">
              <span>Participação do cliente</span>
              <span className="text-emerald-400 font-medium">Ativo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Rules Panel ──────────────────────────────────────────────────────────────

function RulesPanel({ rules, onChange }: { rules: Rules; onChange: (r: Rules) => void }) {
  return (
    <div className="space-y-3">
      {/* Auto-start next */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
        <div>
          <p className="text-sm text-white/80 font-medium">Auto-iniciar próxima etapa</p>
          <p className="text-[11px] text-white/35 mt-0.5">Avança automaticamente ao completar</p>
        </div>
        <Toggle checked={rules.autoStartNext} onChange={(v) => onChange({ ...rules, autoStartNext: v })} />
      </div>

      {/* Buffer time */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
        <div>
          <p className="text-sm text-white/80 font-medium">Buffer entre etapas</p>
          <p className="text-[11px] text-white/35 mt-0.5">Dias de folga entre transições</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...rules, bufferDays: Math.max(0, rules.bufferDays - 1) })}
            className="w-6 h-6 rounded-lg bg-white/[0.08] text-white/60 hover:bg-white/[0.15] transition-colors text-sm font-bold flex items-center justify-center"
          >−</button>
          <span className="w-8 text-center text-sm text-white/90 font-mono font-bold">{rules.bufferDays}</span>
          <button
            type="button"
            onClick={() => onChange({ ...rules, bufferDays: rules.bufferDays + 1 })}
            className="w-6 h-6 rounded-lg bg-white/[0.08] text-white/60 hover:bg-white/[0.15] transition-colors text-sm font-bold flex items-center justify-center"
          >+</button>
        </div>
      </div>

      {/* Repeat on revision */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
        <div>
          <p className="text-sm text-white/80 font-medium">Repetir tarefas em revisão</p>
          <p className="text-[11px] text-white/35 mt-0.5">Reativa tarefas quando há revisão</p>
        </div>
        <Toggle checked={rules.repeatOnRevision} onChange={(v) => onChange({ ...rules, repeatOnRevision: v })} />
      </div>

      {/* Client participation */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
        <div>
          <p className="text-sm text-white/80 font-medium">Participação do cliente</p>
          <p className="text-[11px] text-white/35 mt-0.5">Cliente acessa e aprova diretamente</p>
        </div>
        <Toggle checked={rules.clientParticipation} onChange={(v) => onChange({ ...rules, clientParticipation: v })} />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductTemplateBuilder() {
  const [productName, setProductName] = useState('Social Media Mensal')
  const [category, setCategory] = useState('Marketing Digital')
  const [productType, setProductType] = useState<ProductType>('recurring')
  const [basePrice, setBasePrice] = useState('2500')
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES)
  const [selectedStageId, setSelectedStageId] = useState<string>(DEFAULT_STAGES[0].id)
  const [rules, setRules] = useState<Rules>({
    autoStartNext: true,
    bufferDays: 1,
    repeatOnRevision: false,
    clientParticipation: true,
  })
  const [saved, setSaved] = useState(false)

  const addStage = useCallback(() => {
    const newStage: Stage = {
      id: uid(),
      name: `Etapa ${stages.length + 1}`,
      duration: 3,
      autoStart: false,
      tasks: [],
    }
    setStages((prev) => [...prev, newStage])
    setSelectedStageId(newStage.id)
  }, [stages.length])

  const updateStage = useCallback((updated: Stage) => {
    setStages((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }, [])

  const removeStage = useCallback((id: string) => {
    setStages((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (selectedStageId === id && next.length > 0) setSelectedStageId(next[0].id)
      return next
    })
  }, [selectedStageId])

  const moveStage = useCallback((id: string, dir: number) => {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx < 0) return prev
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[hsl(13_52%_56%/0.04)] blur-[120px]" />
        <div className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full bg-[hsl(222_55%_35%/0.06)] blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[hsl(43_85%_65%/0.02)] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* ── PAGE HEADER ── */}
        <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080d18]/80 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(13_52%_56%)] to-[hsl(43_85%_65%)] flex items-center justify-center shadow-[0_0_20px_hsl(13_52%_56%/0.4)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/35 font-body">Template Builder</p>
                <h1 className="text-base font-bold font-heading text-white leading-tight -mt-0.5">
                  {productName || 'Novo Template'}
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.1] text-white/60 text-sm hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-all duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Duplicar
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/10 transition-all duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Criar Projeto
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold font-heading transition-all duration-200',
                  saved
                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_hsl(142_71%_45%/0.4)]'
                    : 'bg-gradient-to-r from-[hsl(13_52%_56%)] to-[hsl(43_85%_65%)] text-white shadow-[0_4px_20px_hsl(13_52%_56%/0.4)] hover:shadow-[0_6px_28px_hsl(13_52%_56%/0.55)] hover:-translate-y-0.5'
                )}
              >
                {saved ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Salvo!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Salvar Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-[1fr_320px] gap-6">

          {/* LEFT COLUMN */}
          <div className="min-w-0 space-y-6">

            {/* ── SECTION 1: Product Info ── */}
            <GlassCard className="p-5">
              <SectionLabel>1. Informações do Produto</SectionLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Name */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[11px] text-white/40 font-medium">Nome do produto</label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Social Media Mensal"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[hsl(13_52%_56%/0.5)] focus:bg-white/[0.07] transition-all"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-white/40 font-medium">Categoria</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Marketing"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[hsl(13_52%_56%/0.5)] focus:bg-white/[0.07] transition-all"
                  />
                </div>

                {/* Base Price */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-white/40 font-medium">Preço base (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/30">R$</span>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[hsl(13_52%_56%/0.5)] focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                </div>

                {/* Product Type */}
                <div className="col-span-2 md:col-span-4 space-y-1.5">
                  <label className="text-[11px] text-white/40 font-medium">Tipo de produto</label>
                  <div className="flex gap-2">
                    {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setProductType(t)}
                        className={cn(
                          'flex-1 py-2 rounded-xl border text-sm font-medium font-heading transition-all duration-150',
                          productType === t
                            ? 'bg-[hsl(13_52%_56%/0.15)] border-[hsl(13_52%_56%/0.5)] text-[hsl(13_52%_70%)] shadow-[0_0_16px_hsl(13_52%_56%/0.2)]'
                            : 'border-white/[0.07] text-white/40 hover:border-white/[0.15] hover:text-white/70'
                        )}
                      >
                        {PRODUCT_TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* ── SECTION 2 & 3: Pipeline + Tasks ── */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>2. Pipeline & Tarefas por Etapa</SectionLabel>
                <button
                  type="button"
                  onClick={addStage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(13_52%_56%/0.12)] border border-[hsl(13_52%_56%/0.25)] text-[hsl(13_52%_70%)] text-xs font-semibold hover:bg-[hsl(13_52%_56%/0.2)] transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nova Etapa
                </button>
              </div>

              {/* Horizontal scrollable stage builder */}
              <div className="overflow-x-auto pb-4 -mx-1 px-1">
                <div className="flex gap-5 min-w-max">
                  {stages.map((stage, i) => (
                    <StageCard
                      key={stage.id}
                      stage={stage}
                      index={i}
                      total={stages.length}
                      isSelected={selectedStageId === stage.id}
                      onSelect={() => setSelectedStageId(stage.id)}
                      onUpdate={updateStage}
                      onRemove={() => removeStage(stage.id)}
                      onMoveLeft={() => moveStage(stage.id, -1)}
                      onMoveRight={() => moveStage(stage.id, 1)}
                    />
                  ))}

                  {/* Add stage CTA */}
                  <div className="flex-shrink-0 w-[160px] flex items-center justify-center">
                    <button
                      type="button"
                      onClick={addStage}
                      className="w-full h-32 rounded-2xl border-2 border-dashed border-white/[0.08] text-white/25 hover:border-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-all duration-200 flex flex-col items-center justify-center gap-2"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      <span className="text-xs">Etapa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stage count footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04] mt-2">
                <div className="flex -space-x-1">
                  {stages.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full border border-[#080d18] cursor-pointer transition-all',
                        stages[i].id === selectedStageId ? 'bg-[hsl(13_52%_56%)] scale-125' : 'bg-white/20'
                      )}
                      onClick={() => setSelectedStageId(stages[i].id)}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-white/30">
                  {stages.length} etapas · {stages.reduce((a, s) => a + s.tasks.length, 0)} tarefas no total
                </span>
              </div>
            </GlassCard>

            {/* ── SECTION 4: Rules ── */}
            <GlassCard className="p-5">
              <SectionLabel>4. Regras de Automação</SectionLabel>
              <RulesPanel rules={rules} onChange={setRules} />
            </GlassCard>

          </div>

          {/* RIGHT COLUMN — Preview Panel */}
          <div className="space-y-4">
            <GlassCard className="p-5 sticky top-[84px]">
              <SectionLabel>5. Preview do Timeline</SectionLabel>
              <PreviewPanel stages={stages} rules={rules} />

              {/* CTA actions */}
              <div className="mt-5 pt-4 border-t border-white/[0.05] space-y-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(13_52%_56%)] to-[hsl(43_85%_65%)] text-white text-sm font-bold font-heading shadow-[0_4px_20px_hsl(13_52%_56%/0.35)] hover:shadow-[0_6px_28px_hsl(13_52%_56%/0.5)] hover:-translate-y-0.5 transition-all duration-200"
                  onClick={handleSave}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Salvar Template
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.1] text-white/50 text-sm hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-all duration-150"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Duplicar Template
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-500/25 text-blue-400 text-sm hover:bg-blue-500/10 transition-all duration-150"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  Criar Projeto a partir deste
                </button>
              </div>
            </GlassCard>
          </div>

        </div>
      </div>
    </div>
  )
}
