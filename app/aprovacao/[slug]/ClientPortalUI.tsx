'use client'

import { useState, useEffect, useRef } from 'react'
import { ClientPortalSettings } from '@/types/database'
import { clientApprovePost, clientRejectPost, clientRequestRevision } from './actions'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
}

interface Props {
  slug: string
  clientName: string
  settings: ClientPortalSettings
  posts: PostDetail[]
}

export function ClientPortalUI({ slug, clientName, settings, posts }: Props) {
  const [currentPostIdx, setCurrentPostIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIdx, setLightboxIdx] = useState(0)

  // Track slide index for each post's internal carousel
  const [slideIndices, setSlideIndices] = useState<Record<string, number>>({})

  // Comments / Rejection / Revision modal
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'reject' | 'revision' | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [actionPostId, setActionPostId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track scroll for sticky elements or animations if needed
  useEffect(() => {
    document.documentElement.style.setProperty('--purple', settings.theme_color_primary || '#BE4B00')
    document.documentElement.style.setProperty('--rose', settings.theme_color_secondary || '#B4053C')
    // Extract RGB to inject transparency variants if needed, or rely on CSS vars
  }, [settings])

  const scrollToPanel = () => {
    document.getElementById('infoPanelSection')?.scrollIntoView({ behavior: 'smooth' })
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

  const openLightbox = (mediaUrls: string[], startIdx: number = 0) => {
    setLightboxImages(mediaUrls)
    setLightboxIdx(startIdx)
    setLightboxOpen(true)
  }

  const handleApprove = async (postId: string) => {
    try {
      await clientApprovePost(postId, slug)
      toast.success('Post aprovado com sucesso!')
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
        toast.success('Post rejeitado com observações enviadas.')
      } else {
        await clientRequestRevision(actionPostId, slug, actionNote)
        toast.success('Revisão solicitada com sucesso.')
      }
      setActionModalOpen(false)
      setActionNote('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const approvedCount = posts.filter(p => p.client_approval_status === 'approved').length
  const progressPercent = posts.length > 0 ? (approvedCount / posts.length) * 100 : 0

  return (
    <>
      {/* Backgrounds */}
      <div className="hero-bg" style={{ backgroundImage: `url('${settings.wallpaper_url || ''}')` }}></div>
      <div className="hero-overlay"></div>
      <div className="hero-grain"></div>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="dot"></span>Portal de Aprovação</div>
          {settings.logo_url && (
            <img src={settings.logo_url} className="hero-logo-img" alt={clientName} />
          )}
          <div className="hero-divider"></div>
          <p className="hero-tagline">Revise, comente e aprove<br />os conteúdos abaixo</p>
          <div className="hero-progress">
            <div className="pb-wrap"><div className="pb-fill" style={{ width: `${progressPercent}%` }}></div></div>
            <div className="pb-label"><strong>{approvedCount}</strong> de {posts.length} aprovados</div>
          </div>
        </div>
        <div className="hero-scroll" onClick={scrollToPanel}>
          <div className="scroll-line"></div>Rolar
        </div>
      </section>

      {/* Info Panel & Profile */}
      <section id="infoPanelSection" className="info-container">
        <div className="info-panel">
          <div className="info-eyebrow">Aprovação de Conteúdo</div>
          <h2 className="info-title">Perfil de<br /><em>{clientName}</em></h2>
          <div className="info-divider"></div>

          <div className="overview-split">
            <div className="igp reveal visible">
              <div className="igp-top">
                <div className="igp-header-main">
                  <div className="igp-avatar-ring">
                    <img src={settings.ig_avatar_url || ''} alt="Avatar" loading="lazy" />
                  </div>
                  <div className="igp-info-col">
                    <div className="igp-user-row">
                      <span className="igp-username">{settings.ig_username}</span>
                      <span className="igp-dots">···</span>
                    </div>
                    <div className="igp-bio-name">{settings.ig_name}</div>
                    <div className="igp-stats">
                      <div className="igp-stat"><div className="igp-stat-num">{settings.ig_stats_posts}</div><div className="igp-stat-lbl">posts</div></div>
                      <div className="igp-stat"><div className="igp-stat-num">{settings.ig_stats_followers}</div><div className="igp-stat-lbl">seguidores</div></div>
                      <div className="igp-stat"><div className="igp-stat-num">{settings.ig_stats_following}</div><div className="igp-stat-lbl">seguindo</div></div>
                    </div>
                    <div className="igp-bio" dangerouslySetInnerHTML={{ __html: settings.ig_bio?.replace(/\n/g, '<br/>') || '' }}></div>
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
              </div>
              
              <div className="igp-grid">
                {posts.slice(0, 9).map((post, idx) => (
                  <div key={post.id} className="igp-grid-item" onClick={() => scrollToPost(idx)}>
                    <img src={post.media?.[0]?.url || ''} alt={`Post ${idx + 1}`} loading="lazy" />
                    <span className="grid-num">{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="info-progress" style={{ marginTop: '40px' }}>
            <div className="info-label">Progresso de aprovação</div>
            <div className="info-progress-bar">
              <div className="info-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="info-progress-label">
              <span>{approvedCount} de {posts.length} aprovados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Carousel Section */}
      {posts.length > 0 && (
        <section className="posts-carousel-main" id="mainPostsCarousel">
          <button className="pc-nav pc-prev" onClick={() => setCurrentPostIdx(prev => Math.max(0, prev - 1))}>‹</button>
          <button className="pc-nav pc-next" onClick={() => setCurrentPostIdx(prev => Math.min(posts.length - 1, prev + 1))}>›</button>

          <div className="post-indicator">
            {posts.map((_, idx) => (
              <div key={idx} className={`pi-item ${idx === currentPostIdx ? 'active' : ''}`} onClick={() => setCurrentPostIdx(idx)}>
                {idx + 1}
              </div>
            ))}
          </div>

          <div className="posts-horizontal-track" style={{ transform: `translateX(-${currentPostIdx * 100}vw)` }}>
            {posts.map((post, idx) => {
              const currentSlide = slideIndices[post.id] || 0
              const mediaCount = post.media?.length || 0
              
              let statusClass = 'sb-none'
              let statusLabel = 'Aguardando'
              if (post.client_approval_status === 'approved') { statusClass = 'sb-approved'; statusLabel = 'Aprovado' }
              if (post.client_approval_status === 'rejected') { statusClass = 'sb-rejected'; statusLabel = 'Reprovado' }
              if (post.client_approval_status === 'revision_requested') { statusClass = 'sb-pending'; statusLabel = 'Revisão Solicitada' }

              return (
                <section key={post.id} className="post-section">
                  <div className="post-split">
                    <div className="reveal visible">
                      <div className="post-num-badge"><div className="pnb-dot">{idx + 1}</div> {post.publish_date ? format(parseISO(post.publish_date), 'dd/MM') : 'Sem data'}</div>
                      
                      <div className="ig-phone">
                        <div className="ig-bar">
                          <div className="ig-ava"><img src={settings.ig_avatar_url || ''} /></div>
                          <div><div className="ig-handle">{settings.ig_username}</div></div>
                          <div className="ig-type">{mediaCount > 1 ? 'Carrossel' : 'Post'}</div>
                        </div>
                        <div className="ig-carousel">
                          <div className="ig-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                            {post.media?.map((m, midx) => (
                              <div key={midx} className="ig-slide" onClick={() => openLightbox(post.media.map(x => x.url), midx)}>
                                <img src={m.url} />
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
                              <button className="ig-arrow prev" onClick={() => handleIgSlide(post.id, -1, mediaCount)}>‹</button>
                              <button className="ig-arrow next" onClick={() => handleIgSlide(post.id, 1, mediaCount)}>›</button>
                            </>
                          )}
                        </div>
                        <div className="ig-foot">
                          <p className="ig-cap"><strong>{settings.ig_username}</strong> {post.caption}</p>
                        </div>
                      </div>
                    </div>

                    <div className="post-panel reveal visible">
                      <div className="post-head">
                        <h3 className="post-title">{post.v2_tasks?.title}</h3>
                        <br/>
                        <div className={`sb ${statusClass}`}><span className="sbp"></span>{statusLabel}</div>
                      </div>
                      
                      <div className="blk-label">Instruções da Tarefa</div>
                      <div className="caption-blk" dangerouslySetInnerHTML={{ __html: post.v2_tasks?.description || 'Nenhuma instrução adicional.' }}></div>

                      <div className="actions">
                        <button className="abtn btn-ap" onClick={() => handleApprove(post.id)}>✅ Aprovar</button>
                        <button className="abtn btn-rj" onClick={() => {
                          setActionPostId(post.id)
                          setActionType('reject')
                          setActionModalOpen(true)
                        }}>❌ Reprovar</button>
                        <button className="abtn btn-lt" onClick={() => {
                          setActionPostId(post.id)
                          setActionType('revision')
                          setActionModalOpen(true)
                        }}>✍️ Pedir Revisão</button>
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        </section>
      )}

      {/* Action Modal */}
      {actionModalOpen && (
        <div className="modal-overlay open">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{actionType === 'reject' ? 'Reprovar Post' : 'Solicitar Revisão'}</h3>
              <button className="modal-close" onClick={() => setActionModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{actionType === 'reject' ? 'Por favor, detalhe os motivos da reprovação para nossa equipe.' : 'Quais alterações você gostaria que fossem feitas?'}</p>
              <textarea 
                rows={5} 
                value={actionNote} 
                onChange={e => setActionNote(e.target.value)} 
                placeholder="Escreva seus comentários aqui..." 
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn btn-sec" onClick={() => setActionModalOpen(false)}>Cancelar</button>
              <button className="modal-btn btn-pri" disabled={isSubmitting} onClick={handleActionSubmit}>
                {isSubmitting ? 'Enviando...' : 'Enviar Observações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="modal-overlay open" style={{ background: 'rgba(0,0,0,0.9)', zIndex: 3000 }} onClick={() => setLightboxOpen(false)}>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-white text-4xl" onClick={() => setLightboxOpen(false)}>×</button>
            <button className="absolute left-4 top-1/2 text-white text-4xl" onClick={() => setLightboxIdx(prev => Math.max(0, prev - 1))}>‹</button>
            <img src={lightboxImages[lightboxIdx]} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
            <button className="absolute right-4 top-1/2 text-white text-4xl" onClick={() => setLightboxIdx(prev => Math.min(lightboxImages.length - 1, prev + 1))}>›</button>
          </div>
        </div>
      )}
    </>
  )

  function scrollToPost(idx: number) {
    setCurrentPostIdx(idx)
    document.getElementById('mainPostsCarousel')?.scrollIntoView({ behavior: 'smooth' })
  }
}
