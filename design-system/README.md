# Design System · Duas Mãos

Sistema de design da plataforma de gestão de projetos **Duas Mãos**. Construído sobre **Next.js 14**, **Tailwind CSS 3** e componentes **Radix UI**, com tokens derivados da identidade visual da marca.

---

## Estrutura

```
design-system/
├── tokens/
│   ├── colors.ts       # Paleta de cores (espelho das CSS vars)
│   ├── typography.ts   # Tipografia: families, sizes, weights
│   ├── spacing.ts      # Espaçamento 4px base grid
│   ├── radius.ts       # Border radius scale
│   ├── shadows.ts      # Box shadows
│   └── index.ts        # Re-exports
├── components/
│   └── index.ts        # Re-exports de todos os componentes
└── patterns/
    └── index.ts        # Re-exports de todos os padrões
```

---

## Tokens

### Cores

| Token | CSS Variable | Uso |
|-------|-------------|-----|
| `brand.primary` | `--brand-primary` | Ações principais, links |
| `brand.secondary` | `--brand-secondary` | Elementos secundários |
| `brand.accent` | `--brand-accent` | Destaques, badges urgentes |
| `status.success` | `--success` | Confirmações, aprovados |
| `status.warning` | `--warning` | Alertas, pendentes |
| `status.danger` | `--danger` | Erros, atrasados |
| `status.info` | `--info` | Informações, briefing |
| `status.pending` | `--pending` | Em produção |
| `status.draft` | `--draft` | Pausados, rascunhos |

### Tipografia

- **Sans**: Inter (UI, corpo, labels)
- **Serif**: Playfair Display (títulos editoriais, headings)

### Radius

```
xs → 4px   | sm → 8px  | md → 12px
lg → 16px  | xl → 20px | full → 9999px
```

### Sombras

```
xs, sm, md, lg, xl → escala progressiva
glass → efeito glassmorphism
brand → sombra com cor da marca
```

---

## Componentes UI (`/components/ui/`)

| Componente | Descrição |
|-----------|-----------|
| `Button` | 7 variantes: default, primary, secondary, ghost, danger, editorial, outline |
| `Badge` | 16 variantes: semânticas (success/warning/danger/info/pending/draft) + solid + brand |
| `Card` | 6 variantes: default, muted, editorial, status, client, highlight |
| `Input` | Primitivo `Input` + wrapper `InputField` com label/error/hint/icons |
| `Avatar` | Fallback de iniciais, imagem, status indicator + `AvatarGroup` |
| `Dropdown` | Menu completo Radix: items, checkbox, radio, sub-menus, separadores |
| `Modal` | Modal acessível: backdrop, ESC, scroll lock, 5 tamanhos + `useModal` hook |
| `Table` | Tabela semântica com estilos da marca |
| `Tabs` | Abas acessíveis |
| `Dialog` | Dialog primitivo (base para Modal) |

---

## Padrões de Interface (`/components/patterns/`)

### `ProjectCard`
Card de projeto com borda colorida por prioridade, status badge semântico, barra de progresso de tarefas, avatar do responsável e deadline com alerta de atraso.

**Props:** `id, name, clientName, status, priority, deadline, assigneeName, href, completedTasks, totalTasks`

### `ClientCard`
Card de cliente com avatar (iniciais/foto), badge de status, métricas (projetos ativos/total), links de contato e navegação.

**Props:** `id, name, segment, activeProjects, totalProjects, status, email, phone, logoSrc, href`

### `KanbanCard`
Card drag-and-drop do Kanban com prioridade badge + borda colorida, deadline, avatar, e animação de grab.

**Props:** `id, name, clientName, status, priority, deadline, assigneeName, onClick`

### `DashboardWidget`
Widget métrico com ícone acentuado, valor, descrição, trend indicator (up/down/neutral) e glow decoration.

**Props:** `label, value, icon, description, trend, trendValue, trendLabel, accent`

---

## Layout (`/components/layouts/`)

### `Sidebar`
- Logo real da marca (PNG do `/public/brand/`)
- Grupos de navegação (Principal / Produção)
- Indicador de item ativo
- Configurações + logout
- User identity na base (avatar + nome + email)
- **Props:** `userName, userEmail`

### `Header`
- Breadcrumb dinâmico (parentSection / pageTitle)
- Bell de notificações com badge não lida
- Avatar + nome + email do usuário
- **Props:** `userName, userEmail, pageTitle, parentSection`

---

## Assets da Marca (`/public/brand/`)

```
logos/
├── logotipo-dark.png    # Versão escura (para fundos claros)
├── logotipo-light.png   # Versão clara (para fundos escuros)
├── logotipo-primary.png # Versão colorida
└── logotipo-alt.png     # Versão alternativa

symbols/
├── simbolo-dark.png
├── simbolo-light.png
├── simbolo-primary.png
└── simbolo-alt.png

avatars/
├── avatar.png, avatar-1.png, avatar-2.png
└── avatar-brand.png

doodles/
├── doodle-1.png → doodle-4.png
└── criatividade.png

stickers/
└── sticker-1.png → sticker-5.png
```

---

## Utilitários CSS

```css
.glass              /* Glassmorphism: blur + border sutil */
.text-gradient-brand /* Texto com gradiente primário → acento */
.surface-tint       /* Fundo levemente tintado com a cor da marca */
.animate-fade-in    /* Entrada com fade */
.animate-fade-in-up /* Entrada com fade + slide para cima */
.animate-scale-in   /* Entrada com scale */
.animate-slide-in-left / right
```
