'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { SlIcon } from '@/components/ui/StreamlineIcon'

export function ProposalEditor({ proposal }: { proposal: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [clientName, setClientName] = useState(proposal.client_name)
  
  // Default content structure
  const [content, setContent] = useState<any>(proposal.content || {
    colors: {
      primary: '#D65A31',
      secondary: '#222831',
      accent: '#EEEEEE'
    },
    texts: {
      manifestTitle: 'Duas Mãos',
      manifestBody: 'Nosso manifesto...'
    },
    pricing: {
      total: '15000',
      installments: '3'
    }
  })

  // Advanced raw JSON state
  const [rawJson, setRawJson] = useState(JSON.stringify(content, null, 2))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Try parsing the raw JSON to sync back just in case they edited the Advanced tab
      let finalContent = content
      try {
        finalContent = JSON.parse(rawJson)
      } catch (e) {
        // if raw JSON is invalid, stick to content object
      }

      const { error } = await supabase
        .from('proposals')
        .update({ client_name: clientName, content: finalContent })
        .eq('id', proposal.id)

      if (error) throw error

      toast.success('Proposta salva com sucesso!')
      router.refresh()
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">Editar Conteúdo</h2>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <a href={`/proposta/index.html?id=${proposal.id}`} target="_blank" rel="noreferrer">
              <SlIcon name="eye" size={16} className="mr-2" />
              Ver Proposta
            </a>
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-brand-primary text-white">
            <SlIcon name="save" size={16} className="mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-surface-muted/50 border border-border">
          <TabsTrigger value="general">Geral & Cores</TabsTrigger>
          <TabsTrigger value="texts">Textos</TabsTrigger>
          <TabsTrigger value="pricing">Valores</TabsTrigger>
          <TabsTrigger value="advanced">JSON Avançado</TabsTrigger>
        </TabsList>

        <div className="mt-6 p-6 bg-surface-muted/30 border border-border rounded-xl">
          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label>Nome do Cliente</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cor Primária (Hex)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="w-16 h-10 p-1" 
                    value={content.colors?.primary || '#000000'} 
                    onChange={(e) => {
                      const newContent = { ...content, colors: { ...content.colors, primary: e.target.value } }
                      setContent(newContent)
                      setRawJson(JSON.stringify(newContent, null, 2))
                    }} 
                  />
                  <Input 
                    value={content.colors?.primary || '#000000'} 
                    onChange={(e) => {
                      const newContent = { ...content, colors: { ...content.colors, primary: e.target.value } }
                      setContent(newContent)
                      setRawJson(JSON.stringify(newContent, null, 2))
                    }} 
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="texts" className="space-y-6">
            <div className="grid gap-4 max-w-2xl">
              <div className="space-y-2">
                <Label>Título do Manifesto</Label>
                <Input 
                  value={content.texts?.manifestTitle || ''} 
                  onChange={(e) => {
                    const newContent = { ...content, texts: { ...content.texts, manifestTitle: e.target.value } }
                    setContent(newContent)
                    setRawJson(JSON.stringify(newContent, null, 2))
                  }} 
                />
              </div>
              <div className="space-y-2">
                <Label>Texto do Manifesto</Label>
                <Textarea 
                  className="min-h-[150px]"
                  value={content.texts?.manifestBody || ''} 
                  onChange={(e) => {
                    const newContent = { ...content, texts: { ...content.texts, manifestBody: e.target.value } }
                    setContent(newContent)
                    setRawJson(JSON.stringify(newContent, null, 2))
                  }} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input 
                  type="number"
                  value={content.pricing?.total || ''} 
                  onChange={(e) => {
                    const newContent = { ...content, pricing: { ...content.pricing, total: e.target.value } }
                    setContent(newContent)
                    setRawJson(JSON.stringify(newContent, null, 2))
                  }} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <p className="text-sm text-text-muted">
              Edite diretamente o objeto JSON da proposta. Útil para adicionar novas chaves dinâmicas.
            </p>
            <Textarea
              className="font-mono text-sm min-h-[400px] bg-background"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
