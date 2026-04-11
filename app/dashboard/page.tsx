import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import {
  ChevronDown,
  PhoneCall,
  Layout,
  Play,
  Plus,
  Mic,
  Calendar,
  MessageCircle,
  FileText
} from 'lucide-react'

// Helper function
function getGreeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Olá'
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário'
  const greeting = getGreeting(new Date().getHours())

  return (
    <div className="animate-fade-in-up pb-24 max-w-[1600px] mx-auto w-full">
      {/* 2. Header (Humanized) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-12 gap-6 relative z-10 w-full">
        {/* LEFT */}
        <div className="flex items-center gap-5 w-full xl:w-[40%]">
          <Avatar
            name={displayName}
            size="lg"
            variant="brand"
            className="ring-4 ring-brand-primary/10 shadow-sm w-16 h-16 shrink-0"
          />
          <div>
            <h1 className="heading-editorial text-3xl md:text-5xl text-text-primary leading-tight font-black tracking-tight flex items-center gap-2">
              {greeting}, {firstName} <span className="inline-block animate-wave transform origin-bottom-right">👋</span>
            </h1>
            <p className="text-text-secondary mt-1 font-medium font-body text-sm">
              Você tem acompanhamento em <span className="font-bold text-text-primary">12 tarefas</span> hoje.
            </p>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 hidden xl:flex justify-center">
            <h2 className="text-lg font-bold font-heading text-text-primary tracking-wide">Tarefas de Hoje</h2>
        </div>
        
        {/* RIGHT */}
        <div className="flex items-center gap-3 self-start xl:self-center shrink-0 w-full xl:w-[300px] xl:justify-end">
          <span className="text-sm font-bold text-text-muted font-body">Equipe:</span>
          <div className="flex -space-x-2">
            <Avatar name="Alice" size="sm" className="border-2 border-background/50 ring-0 shadow-sm" />
            <Avatar name="Bruno" size="sm" className="border-2 border-background/50 ring-0 shadow-sm" />
            <Avatar name="Carla" size="sm" className="border-2 border-background/50 ring-0 shadow-sm" />
            <div className="w-8 h-8 rounded-full border-2 border-background/50 bg-sand-dark flex items-center justify-center text-[10px] font-bold text-text-secondary z-10 transition-transform hover:scale-105 cursor-pointer shadow-sm">
              +9
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Layout: 3 Columns with gap-8 */}
      <div className="flex flex-col xl:flex-row gap-8 items-start relative z-10">
        
        {/* LEFT: Main Focus Block (~40%) */}
        <div className="w-full xl:w-[40%] shrink-0 flex flex-col gap-6">
          
          {/* Project Selector */}
          <div className="floating-card rounded-[20px] bg-white/40 backdrop-blur-md border border-white/60 p-4 inline-flex items-center justify-between gap-6 cursor-pointer shadow-sm hover:shadow-md transition-all self-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F6E3A2] text-[#A67C00] flex items-center justify-center shadow-inner">
                 <Layout size={20} strokeWidth={2.5}/>
              </div>
              <div>
                <h3 className="font-bold font-heading text-text-primary leading-tight">Projeto Duas Mãos</h3>
                <p className="text-[11px] text-text-muted font-body">Design & Desenvolvimento</p>
              </div>
            </div>
            <ChevronDown size={18} className="text-text-muted ml-4" />
          </div>

          {/* Huge Number & Label */}
          <div className="px-2 mt-2 mb-0 relative">
            <div className="text-[8rem] xl:text-[10rem] font-bold font-heading text-text-primary leading-none tracking-tighter tabular-nums drop-shadow-sm flex items-end relative z-10 -ml-2">
              85<span className="text-5xl xl:text-7xl mb-5 xl:mb-7 ml-1 opacity-90">%</span>
            </div>
            <p className="text-text-secondary font-medium font-body mt-2 text-lg xl:text-xl relative z-10">
              Saúde da operação hoje
            </p>
          </div>

          {/* Subcard with Metrics - Yellow Theme */}
          <div className="w-full bg-[#FFD166] dark:bg-[#d4a841] rounded-[32px] p-7 xl:p-8 text-[#4a3915] dark:text-[#2c220c] shadow-lg relative overflow-hidden flex flex-col mt-4">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <span className="text-sm font-bold font-body">Atividade do Projeto</span>
              <span className="px-4 py-1.5 bg-black/5 rounded-full text-[10px] font-bold font-heading uppercase tracking-widest text-[#4a3915]/60 hover:bg-black/10 transition-colors cursor-pointer">
                Estatística
              </span>
            </div>
            <div className="flex justify-between relative z-10 px-1">
              <div>
                <p className="text-3xl xl:text-4xl font-black font-heading mb-1 tabular-nums flex items-baseline gap-0.5 tracking-tight">26<span className="text-lg xl:text-xl opacity-60">h</span></p>
                <p className="text-[11px] xl:text-xs font-bold opacity-80 font-body uppercase tracking-wider">CallSync</p>
              </div>
              <div>
                <p className="text-3xl xl:text-4xl font-black font-heading mb-1 tabular-nums flex items-baseline gap-0.5 tracking-tight">11<span className="text-lg xl:text-xl opacity-60">h</span></p>
                <p className="text-[11px] xl:text-xs font-bold opacity-80 font-body uppercase tracking-wider">Workshops</p>
              </div>
              <div>
                <p className="text-3xl xl:text-4xl font-black font-heading mb-1 tabular-nums flex items-baseline gap-0.5 tracking-tight">6<span className="text-lg xl:text-xl opacity-60">h</span></p>
                <p className="text-[11px] xl:text-xs font-bold opacity-80 font-body uppercase tracking-wider">Revisões</p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Task Cards (flex-1 main content) */}
        <div className="flex-1 flex flex-col gap-6 pt-2">
          {/* Card 1 - Slightly wider padding for rhythm */}
          <div className="floating-card rounded-[32px] bg-white text-text-primary p-7 xl:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-heading flex items-center gap-3">
                <PhoneCall size={20} strokeWidth={2.5}/>
                Sincronia Estratégica Semanal
              </h3>
              <span className="px-3 py-1.5 bg-[#34A853]/15 text-[#21813A] rounded-full text-[11px] font-bold font-body tracking-wide">Reunião</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8 border-t border-b border-sand-dark/30 py-4">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Quando:</p>
                <p className="text-sm font-bold font-body text-text-primary">Hoje, 10:00 AM</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Equipe:</p>
                <p className="text-sm font-bold font-body text-text-primary">Marketing & Crescimento</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Avatar name="Jão" size="sm" className="border-2 border-white ring-0" />
                  <Avatar name="Gaby" size="sm" className="border-2 border-white ring-0" />
                  <Avatar name="Dan" size="sm" className="border-2 border-white ring-0" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-text-primary flex items-center justify-center text-[10px] font-bold text-white z-10 transition-transform hover:scale-105 cursor-pointer">
                    +7
                  </div>
                </div>
                <span className="text-[11px] text-text-muted font-bold whitespace-nowrap">Pronto para entrar?</span>
              </div>
              <button className="px-5 py-2.5 rounded-full bg-sand hover:bg-sand-dark transition-colors text-xs font-bold font-heading text-text-primary shrink-0 uppercase tracking-widest hover:scale-105 active:scale-95 duration-200 shadow-sm">
                Juntar-se à Reunião
              </button>
            </div>
          </div>

          {/* Card 2 - Highlighted state, slightly tilted or indented rhythm */}
          <div className="floating-card rounded-[32px] bg-white text-text-primary p-6 xl:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-white relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl z-10">
            {/* Visual flare for priority */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-terracotta/5 rounded-bl-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2 relative z-10">
              <h3 className="text-xl font-bold font-heading flex items-center gap-3">
                <Layout size={20} className="text-brand-terracotta"/>
                Revisão de Design
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-brand-terracotta text-white rounded-full text-[11px] font-bold font-body shadow-sm whitespace-nowrap">Alta Prioridade</span>
                <span className="px-3 py-1.5 bg-[#FFD166] text-[#4a3915] rounded-full text-[11px] font-bold font-body whitespace-nowrap">Tarefa</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Tópico:</p>
                <p className="text-sm font-bold font-body text-text-primary leading-snug">Website Duas Mãos</p>
              </div>
              <div className="md:col-span-1">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Descrição:</p>
                <p className="text-sm font-bold font-body text-text-secondary leading-snug">Checar design da main page</p>
              </div>
              <div className="md:col-span-1 md:text-right">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Prazo:</p>
                <p className="text-sm font-bold font-body text-text-primary">22 Mar</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-5 border-t border-sand-dark/20 relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Autores:</span>
                <div className="flex -space-x-2">
                  <Avatar name="Marco" size="sm" className="border-2 border-white ring-0" />
                  <Avatar name="Clara" size="sm" className="border-2 border-white ring-0" />
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white transition-colors text-[11px] font-bold shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 duration-200 group uppercase tracking-widest pl-4">
                <span className="text-brand-primary group-hover:rotate-12 transition-transform">✦</span> Pedir IA para iniciar
              </button>
            </div>
          </div>
          
          {/* Card 3 - More compact, offset right slightly for rhythm effect */}
           <div className="floating-card rounded-[32px] bg-white/80 backdrop-blur-md text-text-primary p-6 xl:p-8 shadow-sm border border-white/50 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md mt-2 ml-0 xl:ml-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold font-heading flex items-center gap-2.5 text-text-secondary">
                <Calendar size={18} strokeWidth={2.5}/>
                Sincronia Time Base
              </h3>
              <span className="px-3 py-1 bg-[#34A853]/15 text-[#21813A] rounded-full text-[11px] font-bold font-body">Reunião</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Quando:</p>
                <p className="text-xs font-bold font-body text-text-secondary">Sex, 17:30</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Equipe:</p>
                <p className="text-xs font-bold font-body text-text-secondary">Líderes de Operação & IA</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Quick Actions Panel (~300px) */}
        <div className="w-full xl:w-[300px] shrink-0 flex flex-col gap-6 pt-2">
          
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="font-bold font-heading text-lg flex items-center gap-2 text-text-primary">
              <span className="text-brand-primary text-xl relative">
                <span className="absolute inset-0 blur-[4px] bg-brand-primary/50 text-transparent">✦</span>
                ✦
              </span> 
              Quick requests
            </h3>
            <button className="text-[11px] font-bold text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-heading hover:scale-105">
              <Plus size={12} strokeWidth={3}/> Set Task
            </button>
          </div>

          {/* Minimal Quick Actions list */}
          <div className="flex flex-col gap-2">
            {[
              { desc: 'Analise o resumo da chamada e destaque os principais pontos', icon: MessageCircle },
              { desc: 'Crie um PDF com tarefas concluídas da semana', icon: FileText },
              { desc: 'Corrija o gráfico de acordo com as metas atualizadas do projeto', icon: Layout },
            ].map((action, i) => (
              <div key={i} className="group relative flex items-center justify-between p-4 py-5 rounded-2xl hover:bg-white/40 cursor-pointer transition-all duration-300 border border-transparent hover:border-white/30">
                <div className="flex flex-col gap-1 w-[85%]">
                   <span className="text-[13px] font-medium text-text-primary font-body leading-snug">{action.desc}</span>
                </div>
                <Play size={12} fill="currentColor" className="text-text-primary opacity-30 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-200 shrink-0" />
              </div>
            ))}
          </div>

          {/* AI Voice block below */}
          <div className="mt-8 floating-card rounded-[28px] bg-white/50 backdrop-blur-md border border-white/70 p-6 flex flex-col gap-4 shadow-[0_10px_30px_rgb(0,0,0,0.03)] cursor-pointer hover:bg-white/70 transition-colors group relative overflow-hidden">
             
            <span className="px-3 py-1 bg-[#8B5CF6]/10 text-[#7C3AED] border border-[#8B5CF6]/10 rounded-full text-[10px] font-bold font-heading uppercase tracking-wider inline-block w-fit relative z-10">
              Voice Tasks
            </span>
            
            <div className="flex items-center justify-between gap-4 relative z-10">
              <h4 className="font-bold font-heading text-text-primary text-[1.35rem] leading-snug w-[60%]">
                Fale algo com Misso!
              </h4>
              <div className="flex-1 max-w-[80px] h-12 flex items-center justify-center gap-[3px] opacity-80 bg-[#8B5CF6]/5 rounded-xl p-2 shrink-0">
                 {/* Waveform fake but mapped to an AI voice style */}
                 <div className="w-[3px] h-3 bg-[#8B5CF6] rounded-full transition-all duration-200 group-hover:h-5"></div>
                 <div className="w-[3px] h-6 bg-[#8B5CF6] rounded-full transition-all duration-300 delay-75 group-hover:h-8"></div>
                 <div className="w-[3px] h-10 bg-[#8B5CF6] rounded-full transition-all duration-150 delay-100 group-hover:h-4"></div>
                 <div className="w-[3px] h-5 bg-[#8B5CF6] rounded-full transition-all duration-500 delay-200 group-hover:h-9"></div>
                 <div className="w-[3px] h-[18px] bg-[#8B5CF6] rounded-full transition-all duration-300 delay-75 group-hover:h-6"></div>
                 <div className="w-[3px] h-7 bg-[#8B5CF6] rounded-full transition-all duration-200 group-hover:h-3"></div>
                 <div className="w-[3px] h-[14px] bg-[#8B5CF6] rounded-full transition-all duration-300 group-hover:h-[22px]"></div>
              </div>
            </div>

            {/* Mic button absolute */}
            <div className="absolute -bottom-4 right-6 relative z-10 w-full flex justify-center mt-3">
               <button className="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgb(0,0,0,0.06)] border border-black/5 hover:scale-110 active:scale-95 transition-all text-text-primary group/mic">
                 <Mic size={22} className="text-text-primary group-hover/mic:text-[#8B5CF6] transition-colors" />
               </button>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  )
}
