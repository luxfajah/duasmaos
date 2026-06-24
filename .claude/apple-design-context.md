# Apple Design Context

## Product
- **Name**: Duas Mãos
- **Description**: Plataforma de gestão de projetos e portal de aprovação de criativos para clientes.
- **Category**: Produtividade e Colaboração / Gestão de Projetos
- **Stage**: Redesign (Aplicações web responsivas)

## Platforms
| Platform | Supported | Min OS | Notes |
|----------|-----------|--------|-------|
| Web      | Yes       | N/A    | Next.js 14 web application responsive for mobile and desktop, inspired by macOS and iOS design |
| iOS      | Yes       | N/A    | Via mobile Safari / web responsiveness |
| macOS    | Yes       | N/A    | Via desktop Safari / Chrome browser |
| iPadOS   | Yes       | N/A    | Responsive tablet layouts |

## Technology
- **UI Framework**: React / Next.js 14 (App Router) / Tailwind CSS 3 / Radix UI
- **Architecture**: Single-window (web view) with responsive panels, sidebar, header layout
- **Apple Technologies**: Inspired by Apple HIG design system (materials, glassmorphism, SF Symbols equivalents, dynamic typography, 3-level depth hierarchy)

## Design System
- **Base**: Custom design system combining Duas Mãos brand identity and Apple HIG foundations
- **Brand Colors**: Terracotta (`--brand-primary`), Olive (`--brand-secondary`), Warm Yellow (`--brand-accent`), Deep Blue (`--brand-deep-blue`)
- **Typography**: Inter (Sans-serif) for body and UI elements, Playfair Display/Fraunces (Serif) for editorial headers/titles
- **Dark Mode**: Supported (system-synced via `next-themes` and `.dark` class)
- **Dynamic Type**: Accessible text scaling and responsive sizes

## Accessibility
- **Target Level**: Baseline & Enhanced (WCAG AA)
- **Key Considerations**: Text contrast (especially in dark mode), screen reader tags, interactive states, clean focus styles

## Users
- **Primary Persona**: Agency Team (Administrators, Project Managers, Designers) and Clients (Reviewers, Decision-makers)
- **Key Use Cases**: Managing client pipelines, updating projects and tasks, uploading proposals, approving creative materials via Client Portal.
- **Known Challenges**: Managing highly dense tables/kanban boards on small screens, ensuring the creative portal feels premium and intuitive for external clients.
