# Graph Report - .  (2026-07-26)

## Corpus Check
- Corpus is ~2,810 words - fits in a single context window. You may not need a graph.

## Summary
- 90 nodes · 101 edges · 8 communities
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core App & Tech Stack
- Dev Dependencies (Build Tooling)
- Buyer PWA Purchase Flow
- Runtime Dependencies
- package.json Manifest
- Wise Design Tokens & Principles
- Merchant Terminal UI
- Git Workflow Protocol

## God Nodes (most connected - your core abstractions)
1. `PWA Pembeli (Buyer PWA)` - 8 edges
2. `PWA Warung (Merchant Terminal)` - 7 edges
3. `Wise Design System (Foundation)` - 6 edges
4. `PWA Pembeli (Customer App)` - 6 edges
5. `scripts` - 5 edges
6. `Primary Tech Stack (Next.js+Tailwind+Prisma+PostgreSQL)` - 5 edges
7. `Dekat Warung Master Design System` - 5 edges
8. `Halaman 1.2 Etalase Warung & Pilih Produk (/warung/[id])` - 5 edges
9. `Halaman 1.3 Checkout & Konfirmasi (/checkout)` - 5 edges
10. `Halaman 1.4 Realtime Order Tracking (/order/[id])` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Dekat Warung App (Project Directive)` --semantically_similar_to--> `Dekat Warung (PRD Business Concept)`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `PostgreSQL` --semantically_similar_to--> `Database (PostgreSQL) - Architecture Participant`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `Next.js 15.5.20 (App Router)` --conceptually_related_to--> `PWA Pembeli (Buyer PWA)`  [INFERRED]
  CLAUDE.md → prd.md
- `Dekat Warung Project (README)` --references--> `Dekat Warung Master Design System`  [EXTRACTED]
  README.md → design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Primary Tech Stack Components (Next.js + Tailwind + Prisma + PostgreSQL)** — claude_primary_stack, claude_nextjs, claude_tailwind, claude_prisma_orm, claude_postgresql [EXTRACTED 1.00]
- **Git Development Lifecycle Protocols** — claude_git_branching_workflow, claude_feature_branch_protocol, claude_auto_merge_protocol, claude_autonomous_workflow_protocol [EXTRACTED 1.00]
- **Realtime Transaction Flow (Buyer -> Server -> DB -> Merchant -> Buyer)** — prd_pwa_pembeli, prd_realtime_engine, prd_postgresql_db, prd_merchant_terminal, prd_order_status_tracking [EXTRACTED 1.00]
- **Buyer Purchase Flow (Discovery -> Etalase -> Checkout -> Tracking)** — design_discovery_page, design_etalase_page, design_checkout_page, design_order_tracking_page [INFERRED 0.85]
- **Merchant Order Lifecycle (Terminal -> Alert -> Stock -> Settings)** — design_terminal_kasir_page, design_order_alert_modal, design_stock_toggle_page, design_settings_page [INFERRED 0.85]
- **Wise Design System Four Core Pillars** — design_lime_universal_action, design_canonical_pill_geometry, design_heavy_typography, design_surface_contrast [EXTRACTED 1.00]

## Communities (8 total, 0 thin omitted)

### Community 0 - "Core App & Tech Stack"
Cohesion: 0.11
Nodes (21): Dekat Warung App (Project Directive), Next.js 15.5.20 (App Router), PostgreSQL, Primary Tech Stack (Next.js+Tailwind+Prisma+PostgreSQL), Prisma ORM, Tailwind CSS, Wise Design System (Sage Canvas + Wise Lime), Full-Screen Alert Modal + Sound Alarm (NEW_ORDER) (+13 more)

### Community 1 - "Dev Dependencies (Build Tooling)"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, prisma, tailwindcss, @types/node, @types/react (+9 more)

### Community 2 - "Buyer PWA Purchase Flow"
Cohesion: 0.24
Nodes (12): Halaman 1.3 Checkout & Konfirmasi (/checkout), Anterin (Delivery) Option, Ambil Sendiri (Pickup) Delivery Option, Halaman 1.1 Discovery & Warung Terdekat (/), Halaman 1.2 Etalase Warung & Pilih Produk (/warung/[id]), Order State DIPROSES (Processing), Order State PENDING (Warning Yellow), Order State SELESAI (Completed) (+4 more)

### Community 3 - "Runtime Dependencies"
Cohesion: 0.18
Nodes (11): next, dependencies, next, @prisma/client, react, react-dom, swr, @prisma/client (+3 more)

### Community 4 - "package.json Manifest"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, postinstall, start, version

### Community 5 - "Wise Design Tokens & Principles"
Cohesion: 0.25
Nodes (8): Canonical 24px Pill Geometry Principle, Heavy Display Typography Weight 900 Principle, Ink Near-Black #0e0f0c, Lime Green as Universal Primary CTA Principle, Sage Canvas Background #e8ebe6, Sage-vs-White Surface Contrast Elevation Principle, Wise Design System (Foundation), Wise Lime Green CTA #9fe870

### Community 6 - "Merchant Terminal UI"
Cohesion: 0.32
Nodes (8): Dekat Warung Master Design System, Shared Component 5.1 Merchant Bottom Bar, Halaman 2.2 Modal Alert Pesanan Masuk, PWA Warung (Merchant Terminal), Halaman 2.4 Pengaturan Warung (/warung-admin/pengaturan), Halaman 2.3 Kelola Stok Quick-Toggle (/warung-admin/stok), Halaman 2.1 Terminal Kasir Utama (/warung-admin), Dekat Warung Project (README)

### Community 7 - "Git Workflow Protocol"
Cohesion: 0.67
Nodes (4): Auto-Merge & Branch Retention Protocol, Autonomous Workflow Protocol, Feature Branch Development Lifecycle, Git & Branching Workflow (Strict Rules)

## Knowledge Gaps
- **37 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dev Dependencies (Build Tooling)` to `package.json Manifest`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `package.json Manifest`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `Dekat Warung Master Design System` connect `Merchant Terminal UI` to `Buyer PWA Purchase Flow`, `Wise Design Tokens & Principles`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `PWA Warung (Merchant Terminal)` (e.g. with `Shared Component 5.1 Merchant Bottom Bar` and `PWA Pembeli (Customer App)`) actually correct?**
  _`PWA Warung (Merchant Terminal)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core App & Tech Stack` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies (Build Tooling)` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._