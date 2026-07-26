# Graph Report - .  (2026-07-26)

## Corpus Check
- Corpus is ~1,036 words - fits in a single context window. You may not need a graph.

## Summary
- 25 nodes · 28 edges · 4 communities
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Buyer & Realtime Features
- Project Directive & Merchant UX
- Primary Tech Stack
- Git Workflow Protocols

## God Nodes (most connected - your core abstractions)
1. `PWA Pembeli (Buyer PWA)` - 8 edges
2. `Primary Tech Stack (Next.js+Tailwind+Prisma+PostgreSQL)` - 5 edges
3. `Dekat Warung (PRD Business Concept)` - 4 edges
4. `PWA Warung (Merchant Terminal)` - 4 edges
5. `Backend Server & Realtime Engine (WebSocket)` - 4 edges
6. `Dekat Warung App (Project Directive)` - 3 edges
7. `Next.js 15.5.20 (App Router)` - 2 edges
8. `PostgreSQL` - 2 edges
9. `Git & Branching Workflow (Strict Rules)` - 2 edges
10. `Feature Branch Development Lifecycle` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Dekat Warung App (Project Directive)` --semantically_similar_to--> `Dekat Warung (PRD Business Concept)`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `Next.js 15.5.20 (App Router)` --conceptually_related_to--> `PWA Pembeli (Buyer PWA)`  [INFERRED]
  CLAUDE.md → prd.md
- `PostgreSQL` --semantically_similar_to--> `Database (PostgreSQL) - Architecture Participant`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md

## Hyperedges (group relationships)
- **Primary Tech Stack Components (Next.js + Tailwind + Prisma + PostgreSQL)** — claude_primary_stack, claude_nextjs, claude_tailwind, claude_prisma_orm, claude_postgresql [EXTRACTED 1.00]
- **Realtime Transaction Flow (Buyer -> Server -> DB -> Merchant -> Buyer)** — prd_pwa_pembeli, prd_realtime_engine, prd_postgresql_db, prd_merchant_terminal, prd_order_status_tracking [EXTRACTED 1.00]
- **Git Development Lifecycle Protocols** — claude_git_branching_workflow, claude_feature_branch_protocol, claude_auto_merge_protocol, claude_autonomous_workflow_protocol [EXTRACTED 1.00]

## Communities (4 total, 0 thin omitted)

### Community 0 - "Buyer & Realtime Features"
Cohesion: 0.29
Nodes (8): Custom Request Box (out-of-catalog orders), Delivery Options (Pickup / Anterin +Rp 2.000), Haversine / PostGIS Geolocation Calculation, Realtime Order Status Tracking (PENDING/DIPROSES/SIAP/SELESAI/BATAL), Payment Methods (Cash / QRIS / Transfer), PWA Pembeli (Buyer PWA), Active Warung Radius <= 200m Filter, Backend Server & Realtime Engine (WebSocket)

### Community 1 - "Project Directive & Merchant UX"
Cohesion: 0.29
Nodes (7): Dekat Warung App (Project Directive), Wise Design System (Sage Canvas + Wise Lime), Full-Screen Alert Modal + Sound Alarm (NEW_ORDER), Dekat Warung (PRD Business Concept), Hyper-local Quick Commerce (radius-based), PWA Warung (Merchant Terminal), Quick Stock Switcher (Ada/Habis toggle)

### Community 2 - "Primary Tech Stack"
Cohesion: 0.33
Nodes (6): Next.js 15.5.20 (App Router), PostgreSQL, Primary Tech Stack (Next.js+Tailwind+Prisma+PostgreSQL), Prisma ORM, Tailwind CSS, Database (PostgreSQL) - Architecture Participant

### Community 3 - "Git Workflow Protocols"
Cohesion: 0.67
Nodes (4): Auto-Merge & Branch Retention Protocol, Autonomous Workflow Protocol, Feature Branch Development Lifecycle, Git & Branching Workflow (Strict Rules)

## Knowledge Gaps
- **10 isolated node(s):** `Tailwind CSS`, `Prisma ORM`, `Wise Design System (Sage Canvas + Wise Lime)`, `Hyper-local Quick Commerce (radius-based)`, `Haversine / PostGIS Geolocation Calculation` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PWA Pembeli (Buyer PWA)` connect `Buyer & Realtime Features` to `Project Directive & Merchant UX`, `Primary Tech Stack`?**
  _High betweenness centrality (0.373) - this node is a cross-community bridge._
- **Why does `Dekat Warung (PRD Business Concept)` connect `Project Directive & Merchant UX` to `Buyer & Realtime Features`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._
- **Why does `Primary Tech Stack (Next.js+Tailwind+Prisma+PostgreSQL)` connect `Primary Tech Stack` to `Project Directive & Merchant UX`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **What connects `Tailwind CSS`, `Prisma ORM`, `Wise Design System (Sage Canvas + Wise Lime)` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._