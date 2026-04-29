'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ClientPortalSettings } from '@/types/database'
import { clientApprovePost, clientRejectPost, clientRequestRevision } from './actions'
import { toast } from 'sonner'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// --- Types ---
interface PostMedia {
  id: string
  url: string
  type: string
}

interface PostDetail {
  id: string
  client_approval_status: string
  publish_date: string | null
  caption: string | null
  media: PostMedia[]
  v2_tasks: {
    id: string
    title: string
    description: string | null
  }
  task_comments?: {
    id: string
    body: string
    created_at: string
    comment_type: string
    profiles: {
      full_name: string | null
      role: string | null
    } | null
  }[]
}

interface Props {
  slug: string
  clientName: string
  settings: ClientPortalSettings
  posts: PostDetail[]
}

// --- Hook for Animations ---
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export function ClientPortalUI({ slug, clientName, settings, posts }: Props) {
  const [loading, setLoading] = useState(true)
  const [currentPostIdx, setCurrentPostIdx] = useState(0)
  const [lightboxPost, setLightboxPost] = useState<PostDetail | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [slideIndices, setSlideIndices] = useState<Record<string, number>>({})

  // Modal states
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'reject' | 'revision' | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [actionPostId, setActionPostId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)

  // Initialization
  useEffect(() => {
    // Inject Colors
    document.documentElement.style.setProperty('--purple', settings.theme_color_primary || '#BE4B00')
    document.documentElement.style.setProperty('--rose', settings.theme_color_secondary || '#B4053C')
    document.documentElement.style.setProperty('--bg', settings.wallpaper_url ? `url(${settings.wallpaper_url})` : '#FAF7F5')

    // Handle Mobile Resize
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Preloader timeout
    const timer = setTimeout(() => setLoading(false), 2000)

    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [settings])

  useReveal()

  // --- Handlers ---
  const handleApprove = async (postId: string) => {
    try {
      await clientApprovePost(postId, slug)
      toast.success('Post aprovado!')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleActionSubmit = async () => {
    if (!actionPostId || !actionType) return
    if (!actionNote.trim()) {
      toast.error('O comentário é obrigatório.')
      return
    }

    try {
      setIsSubmitting(true)
      if (actionType === 'reject') {
        await clientRejectPost(actionPostId, slug, actionNote)
        toast.success('Post reprovado.')
      } else {
        await clientRequestRevision(actionPostId, slug, actionNote)
        toast.success('Revisão solicitada.')
      }
      setActionModalOpen(false)
      setActionNote('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIgSlide = (postId: string, dir: number, max: number) => {
    setSlideIndices(prev => {
      const current = prev[postId] || 0
      let next = current + dir
      if (next < 0) next = max - 1
      if (next >= max) next = 0
      return { ...prev, [postId]: next }
    })
  }

  const goToPost = (idx: number) => {
    setCurrentPostIdx(idx)
    const el = document.getElementById(`post-section-${idx}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }

  // Update current index based on scroll position
  useEffect(() => {
    const track = carouselRef.current
    if (!track) return

    const handleScroll = () => {
      const idx = Math.round(track.scrollLeft / track.offsetWidth)
      if (idx !== currentPostIdx && !isNaN(idx)) setCurrentPostIdx(idx)
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => track.removeEventListener('scroll', handleScroll)
  }, [currentPostIdx])

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)
    const days = eachDayOfInterval({ start, end })
    const prefix = Array(getDay(start)).fill(null)
    return [...prefix, ...days]
  }, [])

  // Statistics
  const approvedCount = posts.filter(p => p.client_approval_status === 'approved').length
  const rejectedCount = posts.filter(p => p.client_approval_status === 'rejected').length
  const pendingCount = posts.length - approvedCount - rejectedCount
  const progressPercent = posts.length > 0 ? (approvedCount / posts.length) * 100 : 0

  // --- Render Helpers ---
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved': return { label: 'Aprovado', cls: 'sb-approved' }
      case 'rejected': return { label: 'Reprovado', cls: 'sb-rejected' }
      case 'revision_requested': return { label: 'Em Revisão', cls: 'sb-pending' }
      default: return { label: 'Aguardando', cls: 'sb-none' }
    }
  }

  return (
    <>
      {/* Preloader */}
      <div className={`preloader ${!loading ? 'hidden' : ''}`}>
        <div className="loader-content">
          {settings.logo_url && <img src={settings.logo_url} className="loader-logo" alt="Logo" />}
          <div className="loader-bar-wrap">
            <div className="loader-bar"></div>
          </div>
        </div>
      </div>

      {/* Backgrounds */}
      <div className="hero-bg" style={{ backgroundImage: `url('${settings.wallpaper_url || ''}')` }}></div>
      <div className="hero-grain"></div>

      {/* Hero Section (SEC 1) */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="dot"></span>Planejamento de conteúdo · {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </div>
          {settings.logo_url && (
            <img src={settings.logo_url} className="hero-logo-img" alt={clientName} />
          )}
          <div className="hero-divider"></div>
          <p className="hero-tagline">Revise, comente e aprove<br />os conteúdos abaixo</p>
          <div className="hero-progress">
            <div className="pb-wrap">
              <div className="pb-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="pb-label"><strong>{approvedCount}</strong> de {posts.length} aprovados</div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button 
              onClick={async () => {
                const { logoutPortal } = await import('./actions')
                await logoutPortal(slug)
                window.location.reload()
              }}
              className="abtn btn-lt"
              style={{ fontSize: '10px', padding: '8px 16px', opacity: 0.7 }}
            >
              Sair do Portal
            </button>
          </div>
        </div>
        <div className="hero-scroll" onClick={() => document.getElementById('infoPanelSection')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="scroll-line"></div>Rolar
        </div>
      </section>

      {/* Info Panel (SEC 2: Summary + Calendar) */}
      <section id="infoPanelSection" className="info-container">
        <div className="info-panel reveal">
          <a href="#" className="download-all-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar Todos os Posts
          </a>
          <div className="info-eyebrow">Planejamento · {format(new Date(), 'MMMM yyyy', { locale: ptBR })}</div>
          <h2 className="info-title">Conteúdo para<br /><em>revisão e aprovação</em></h2>
          <div className="info-divider"></div>

          <div className="info-grid-content">
            {/* Left: Summary */}
            <div className="info-summary-col">
              <div className="info-row">
                <div className="info-icon">📋</div>
                <div>
                  <div className="info-label">Foco do mês</div>
                  <div className="info-value">{settings.focus_of_month || 'Apresentação da marca, autoridade e engajamento.'}</div>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">📅</div>
                <div>
                  <div className="info-label">Período das postagens</div>
                  <div className="info-value">
                    {settings.planning_period 
                      ? format(parseISO(settings.planning_period + '-01'), 'MMMM yyyy', { locale: ptBR }) 
                      : format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">⏰</div>
                <div>
                  <div className="info-label">Prazo para aprovação</div>
                  <div className="info-value">
                    {settings.deadline_description 
                      ? format(parseISO(settings.deadline_description), "dd 'de' MMMM", { locale: ptBR })
                      : 'Aguardamos seu feedback para iniciar a produção.'}
                  </div>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">🎯</div>
                <div>
                  <div className="info-label">Funil de conteúdo</div>
                  <div className="info-value">{posts.length} publicações estratégicas programadas.</div>
                </div>
              </div>
            </div>

            {/* Right: Calendar */}
            <div className="info-calendar-col">
              <div className="calendar-wrapper">
                <div className="calendar-header">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="calendar-day-name">{d}</div>)}
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="calendar-day empty"></div>
                    
                    const dayPosts = posts.filter(p => p.publish_date && isSameDay(parseISO(p.publish_date), day))
                    const postIdx = posts.findIndex(p => p.publish_date && isSameDay(parseISO(p.publish_date), day))

                    return (
                      <div 
                        key={day.toISOString()} 
                        className={`calendar-day ${dayPosts.length > 0 ? 'has-post' : ''}`}
                        onClick={() => dayPosts.length > 0 && goToPost(postIdx)}
                      >
                        {dayPosts.length > 0 && (
                          <img src={dayPosts[0].media?.[0]?.url || ''} alt="" />
                        )}
                        <div className="day-number">{format(day, 'd')}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="info-progress">
            <div className="info-label">Progresso de aprovação</div>
            <div className="info-progress-bar">
              <div className="info-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="info-progress-label">
              <span>{approvedCount} de {posts.length} aprovados</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Overview (SEC 3: IG Profile Full Simulation) */}
      <section id="overview" className="overview-section">
        <div className="overview-split reveal">
          <div className="igp">
            <div className="igp-top">
              <div className="igp-header-main">
                <div className="igp-avatar-ring">
                  <img src={settings.ig_avatar_url || ''} alt="Avatar" />
                </div>
                <div className="igp-info-col">
                  <div className="igp-user-row">
                    <span className="igp-username">{settings.ig_username}</span>
                    <span className="igp-dots">···</span>
                  </div>
                  
                  <div className="igp-bio-name">{settings.ig_name}</div>
                  
                  <div className="igp-stats">
                    <div className="igp-stat"><span className="igp-stat-num">{settings.ig_stats_posts || 0}</span> <span className="igp-stat-lbl">posts</span></div>
                    <div className="igp-stat"><span className="igp-stat-num">{settings.ig_stats_followers || '0'}</span> <span className="igp-stat-lbl">seguidores</span></div>
                    <div className="igp-stat"><span className="igp-stat-num">{settings.ig_stats_following || '0'}</span> <span className="igp-stat-lbl">seguindo</span></div>
                  </div>

                  <div className="igp-bio" dangerouslySetInnerHTML={{ __html: settings.ig_bio?.replace(/\n/g, '<br/>') || '' }}></div>
                  
                  <div className="igp-followed" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#999', marginTop: '12px' }}>
                    <div className="igp-followed-pics" style={{ display: 'flex' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ccc', border: '1.5px solid #fff' }}></div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#bbb', border: '1.5px solid #fff', marginLeft: '-8px' }}></div>
                    </div>
                    <span>Seguido por <strong>duasmaos</strong> e outras pessoas</span>
                  </div>
                  
                  <div className="igp-actions">
                    <button className="igp-btn">Seguindo ▾</button>
                    <button className="igp-btn">Enviar mensagem</button>
                    <button className="igp-btn-add">👤⁺</button>
                  </div>
                </div>
              </div>

              <div className="igp-highlights">
                {settings.ig_highlights?.map((hl: any, idx: number) => (
                  <div key={idx} className="igp-hl">
                    <div className="igp-hl-circle">
                      {hl.image_url ? <img src={hl.image_url} alt={hl.title} /> : <span>📌</span>}
                    </div>
                    <div className="igp-hl-label">{hl.title}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="igp-tabs">
              <div className="igp-tab active">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <div className="igp-tab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M10 8l6 4-6 4V8z"/></svg>
              </div>
              <div className="igp-tab">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3"/></svg>
              </div>
            </div>

            <div className="igp-grid">
              {posts.map((post, idx) => (
                <div key={post.id} className="igp-grid-item" onClick={() => goToPost(idx)}>
                  <img src={post.media?.[0]?.url || ''} alt="" />
                  <span className="grid-num">{String(idx + 1).padStart(2, '0')}</span>
                  {post.media?.length > 1 && <span className="grid-multi">▢</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Posts Carousel (Individual Details) */}
      <section className="posts-carousel-main" id="mainPostsCarousel">
        {/* Navigation Arrows */}
        <button className="pc-nav pc-prev" onClick={() => setCurrentPostIdx(prev => Math.max(0, prev - 1))}>‹</button>
        <button className="pc-nav pc-next" onClick={() => setCurrentPostIdx(prev => Math.min(posts.length - 1, prev + 1))}>›</button>

        {/* Indicator */}
        <div className="post-indicator">
          {posts.map((_, idx) => (
            <div key={idx} className={`pi-item ${idx === currentPostIdx ? 'active' : ''}`} onClick={() => goToPost(idx)}>
              {idx + 1}
            </div>
          ))}
        </div>

        <div className="posts-horizontal-track" ref={carouselRef}>
          {posts.map((post, idx) => {
            const currentSlide = slideIndices[post.id] || 0
            const mediaCount = post.media?.length || 0
            const status = getStatusInfo(post.client_approval_status)

            return (
              <section key={post.id} id={`post-section-${idx}`} className="post-section">
                <div className="post-split reveal">
                  {/* Mobile Meta Bar */}
                  {isMobile && (
                    <div className="mobile-meta-bar">
                      <div className="post-num-badge">
                        <div className="pnb-dot">{idx + 1}</div> 
                        {post.publish_date ? format(parseISO(post.publish_date), 'dd/MM') : 'S/D'}
                      </div>
                      <div className={`sb ${status.cls}`}><span className="sbp"></span>{status.label}</div>
                    </div>
                  )}

                  {/* Left: Phone Mockup */}
                  <div>
                    {!isMobile && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div className="post-num-badge" style={{ marginBottom: 0 }}>
                          <div className="pnb-dot">{idx + 1}</div> 
                          {post.publish_date ? format(parseISO(post.publish_date), 'dd/MM') : 'Sem data'}
                        </div>
                        <a href="#" className="download-post-btn" style={{ float: 'none', margin: 0 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </a>
                      </div>
                    )}
                    
                    <div className="ig-phone" onClick={() => { setLightboxPost(post); setLightboxIdx(currentSlide); }}>
                      <div className="ig-bar">
                        <div className="ig-ava"><img src={settings.ig_avatar_url || ''} alt="" /></div>
                        <div className="ig-handle">{settings.ig_username}</div>
                        <div className="ig-type">{mediaCount > 1 ? 'Carrossel' : 'Post'}</div>
                      </div>
                      <div className="ig-carousel">
                        <div className="ig-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                          {post.media?.map((m, midx) => (
                            <div key={midx} className="ig-slide">
                              <img src={m.url} alt="" />
                            </div>
                          ))}
                        </div>
                        {mediaCount > 1 && (
                          <>
                            <div className="ig-dots">
                              {post.media.map((_, midx) => (
                                <div key={midx} className={`ig-dot ${midx === currentSlide ? 'active' : ''}`} />
                              ))}
                            </div>
                            <button className="ig-arrow prev" onClick={(e) => { e.stopPropagation(); handleIgSlide(post.id, -1, mediaCount) }}>‹</button>
                            <button className="ig-arrow next" onClick={(e) => { e.stopPropagation(); handleIgSlide(post.id, 1, mediaCount) }}>›</button>
                          </>
                        )}
                        {mediaCount > 1 && <div className="sc">{currentSlide + 1} / {mediaCount}</div>}
                      </div>
                      <div className="ig-foot">
                        <p className="ig-cap"><strong>{settings.ig_username}</strong> {post.caption}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Info Panel */}
                  <div className="post-panel">
                    <div className="post-head">
                      <div>
                        {!isMobile && <div className="post-eyebrow">Publicação Sugerida</div>}
                        <h3 className="post-title">{post.v2_tasks?.title}</h3>
                        {!isMobile && <div className={`sb ${status.cls}`}><span className="sbp"></span>{status.label}</div>}
                      </div>
                    </div>

                    <div className="blk-label">Objetivo e Instruções</div>
                    <div className="caption-blk" dangerouslySetInnerHTML={{ __html: post.v2_tasks?.description || 'Conteúdo em fase de aprovação.' }}></div>

                    <div className="blk-label">Legenda Final</div>
                    <div className="caption-blk" style={{ background: '#fcfcfc', borderStyle: 'dashed' }}>
                      {post.caption}
                    </div>
                  </div>
                </div>

                <div className="post-actions-below reveal">
                  <div className="actions">
                    <div className="actions-left">
                      <button className="abtn btn-ap" onClick={() => handleApprove(post.id)}>✓ Aprovar</button>
                      <button className="abtn btn-rj" onClick={() => {
                        setActionPostId(post.id)
                        setActionType('reject')
                        setActionModalOpen(true)
                      }}>✎ Reprovar</button>
                      <button className="abtn btn-lt" onClick={() => {
                        setActionPostId(post.id)
                        setActionType('revision')
                        setActionModalOpen(true)
                      }}>⏳ Revisar</button>
                    </div>
                    <button className="abtn btn-cm" onClick={() => { setLightboxPost(post); setLightboxIdx(0); }}>💬 Feedback</button>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-bg"></div>
        <div className="footer-grain"></div>
        <div className="footer-content reveal">
          <h2 className="footer-title">Status Final das<br /><em>Travessias</em></h2>
          <div className="footer-div"></div>
          <p className="footer-body">
            Abaixo, o resumo total do que já foi validado pela sua equipe.
          </p>
          <div className="footer-summary">
            <div className="fs-item">
              <div className="fs-num green">{approvedCount}</div>
              <div className="fs-lbl">Aprovados</div>
            </div>
            <div className="fs-item">
              <div className="fs-num yellow">{pendingCount}</div>
              <div className="fs-lbl">Pendentes</div>
            </div>
            <div className="fs-item">
              <div className="fs-num wine">{rejectedCount}</div>
              <div className="fs-lbl">Reprovados</div>
            </div>
          </div>
          <div className="footer-sig">
            Curadoria por <strong>Duas Mãos</strong>
          </div>
        </div>
      </footer>

      {/* Action Modal (Reject/Revision) */}
      {actionModalOpen && (
        <div className="modal-overlay open">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{actionType === 'reject' ? 'Reprovar Post' : 'Solicitar Revisão'}</h3>
              <button className="modal-close" onClick={() => setActionModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{actionType === 'reject' ? 'Descreva o que não funcionou neste post.' : 'O que você gostaria de ajustar neste conteúdo?'}</p>
              <textarea 
                rows={5} 
                value={actionNote} 
                onChange={e => setActionNote(e.target.value)} 
                placeholder="Ex: Mudar a cor do fundo, ajustar o texto do card 3..." 
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn btn-sec" onClick={() => setActionModalOpen(false)}>Cancelar</button>
              <button className="modal-btn btn-pri" disabled={isSubmitting} onClick={handleActionSubmit}>
                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Lightbox */}
      {lightboxPost && (
        <div className="modal-overlay open" style={{ background: 'rgba(0,0,0,0.95)', zIndex: 3000 }}>
          <div className="lb-backdrop" onClick={() => setLightboxPost(null)}></div>
          <div className="lb-split">
            <div className="lb-left">
              <div className="lb-slice-container">
                <div className="lb-track" style={{ transform: `translateX(-${lightboxIdx * 100}%)` }}>
                  {lightboxPost.media?.map((m, midx) => (
                    <div key={midx} className="lb-track-item">
                      <img src={m.url} alt="" />
                    </div>
                  ))}
                </div>
                {lightboxPost.media?.length > 1 && (
                  <>
                    <button className="lb-left-prev" disabled={lightboxIdx === 0} onClick={() => setLightboxIdx(p => p - 1)}>‹</button>
                    <button className="lb-left-next" disabled={lightboxIdx === lightboxPost.media.length - 1} onClick={() => setLightboxIdx(p => p + 1)}>›</button>
                    <div className="lb-dots">
                      {lightboxPost.media.map((_, i) => (
                        <div key={i} className={`lb-dot-item ${i === lightboxIdx ? 'active' : ''}`} onClick={() => setLightboxIdx(i)}></div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="lb-right">
              <div className="lb-rh">
                <div className="lb-rh-ava"><img src={settings.ig_avatar_url || ''} alt="" /></div>
                <div className="lb-rh-name">{settings.ig_username}</div>
                <button className="lb-rh-close" onClick={() => setLightboxPost(null)}>×</button>
              </div>
              <div className="lb-rbody">
                <div className="lb-rcaption">
                  <strong>{settings.ig_username}</strong>
                  {lightboxPost.caption}
                </div>
                <div className="lb-rdiv"></div>
                <div className="lb-rfeedback-lbl">Histórico e Comentários</div>
                <div className="comments-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lightboxPost.task_comments && lightboxPost.task_comments.length > 0 ? (
                    lightboxPost.task_comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="c-meta">
                          <strong>{comment.profiles?.full_name || 'Usuário'}</strong> · {format(parseISO(comment.created_at), 'dd/MM HH:mm')}
                        </div>
                        <div className="c-text">{comment.body}</div>
                      </div>
                    ))
                  ) : (
                    <div className="c-empty">Nenhum feedback ainda.</div>
                  )}
                </div>
              </div>

              <div className="lb-raction-row">
                 <button className="lb-abtn lb-abtn-ap" onClick={() => { handleApprove(lightboxPost.id); setLightboxPost(null); }}>✓ Aprovar</button>
                 <button className="lb-abtn lb-abtn-rj" onClick={() => { setActionPostId(lightboxPost.id); setActionType('reject'); setActionModalOpen(true); setLightboxPost(null); }}>✎ Reprovar</button>
                 <button className="lb-abtn lb-abtn-lt" onClick={() => { setActionPostId(lightboxPost.id); setActionType('revision'); setActionModalOpen(true); setLightboxPost(null); }}>⏳ Revisar</button>
              </div>

              <div className="lb-rcomment-input">
                <textarea 
                  placeholder="Adicionar um comentário..." 
                  value={actionNote} 
                  onChange={e => setActionNote(e.target.value)}
                />
                <button className="lb-rpost-btn" onClick={handleActionSubmit}>Publicar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
