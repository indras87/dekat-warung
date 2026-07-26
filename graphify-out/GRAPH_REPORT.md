# Graph Report - .  (2026-07-26)

## Corpus Check
- 38 files · ~10,630 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 272 nodes · 421 edges · 20 communities (14 shown, 6 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.81)
- Token cost: 1,200 input · 4,200 output

## Community Hubs (Navigation)
- Buyer & Merchant Page UI
- Docker Compose Infra
- TSConfig & Next Types
- Runtime Dependencies
- design.md Page Specs
- Discovery/Settings/Nav
- Checkout/Etalase/Cart UI
- Core Directives & Tech Stack
- Dev Dependencies
- Layout, Cart & Providers
- PWA Manifest
- Wise Design Tokens
- API Routes & Prisma Client
- App Icon SVG Brand
- Git Workflow Protocol
- Seed Script
- Docker Entrypoint
- next.config
- postcss.config
- tailwind.config

## God Nodes (most connected - your core abstractions)
1. `Dekat Warung README` - 20 edges
2. `compilerOptions` - 16 edges
3. `formatRupiah()` - 13 edges
4. `PWA Warung (Merchant Terminal)` - 11 edges
5. `PWA Pembeli (Buyer PWA)` - 8 edges
6. `getDefaultMerchantWarung()` - 8 edges
7. `scripts` - 8 edges
8. `app Service (Next.js)` - 8 edges
9. `Wise Design System (Foundation)` - 6 edges
10. `PWA Pembeli (Customer App)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Dekat Warung App (Project Directive)` --semantically_similar_to--> `Dekat Warung (PRD Business Concept)`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `Primary Tech Stack (Next.js+Tailwind+Prisma+PostgreSQL)` --references--> `tailwindcss`  [EXTRACTED]
  CLAUDE.md → package.json
- `PostgreSQL` --semantically_similar_to--> `Database (PostgreSQL) - Architecture Participant`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `Next.js 15.5.20 (App Router)` --conceptually_related_to--> `PWA Pembeli (Buyer PWA)`  [INFERRED]
  CLAUDE.md → prd.md
- `postgres:16-alpine Image` --conceptually_related_to--> `Haversine Radius <= 200m Rule`  [AMBIGUOUS]
  docker-compose.yml → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Realtime Polling Architecture (4s)** — readme_api_warung_pending_order, readme_api_orders, readme_polling_realtime_decision, readme_route_order_tracking, readme_route_warung_admin [INFERRED 0.85]
- **Container Startup Dependency Chain** — docker_compose_yml_app_service, docker_compose_yml_db_service, docker_compose_yml_db_healthcheck, docker_compose_yml_depends_on_healthy, docker_compose_yml_database_url_binding [EXTRACTED 1.00]
- **Order Lifecycle Flow (checkout -> status -> tracking)** — readme_route_checkout, readme_order_status_machine, readme_seed_pending_order, readme_route_order_tracking [INFERRED 0.75]
- **Primary Tech Stack Components (Next.js + Tailwind + Prisma + PostgreSQL)** — claude_primary_stack, claude_nextjs, claude_prisma_orm, claude_postgresql [EXTRACTED 1.00]
- **Git Development Lifecycle Protocols** — claude_git_branching_workflow, claude_feature_branch_protocol, claude_auto_merge_protocol, claude_autonomous_workflow_protocol [EXTRACTED 1.00]
- **Realtime Transaction Flow (Buyer -> Server -> DB -> Merchant -> Buyer)** — prd_pwa_pembeli, prd_realtime_engine, prd_postgresql_db, prd_order_status_tracking [EXTRACTED 1.00]
- **Buyer Purchase Flow (Discovery -> Etalase -> Checkout -> Tracking)** — design_discovery_page, design_etalase_page, design_checkout_page, design_order_tracking_page [INFERRED 0.85]
- **Merchant Order Lifecycle (Terminal -> Alert -> Stock -> Settings)** — design_terminal_kasir_page, design_order_alert_modal, design_stock_toggle_page, design_settings_page [INFERRED 0.85]
- **Wise Design System Four Core Pillars** — design_lime_universal_action, design_canonical_pill_geometry, design_heavy_typography, design_surface_contrast [EXTRACTED 1.00]

## Communities (20 total, 6 thin omitted)

### Community 0 - "Buyer & Merchant Page UI"
Cohesion: 0.13
Nodes (28): BANNER, OrderTrackingPage(), TrackedOrder, TerminalPage(), AudioHandle, MerchantAlertModal(), MerchantTerminalClient(), OrderCard() (+20 more)

### Community 1 - "Docker Compose Infra"
Cohesion: 0.10
Nodes (32): app Build Context (root Dockerfile), app Service (Next.js), DATABASE_URL Env Binding, pg_isready Healthcheck, db Service (PostgreSQL), depends_on service_healthy Gate, pgdata Volume, postgres:16-alpine Image (+24 more)

### Community 2 - "TSConfig & Next Types"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 3 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (22): next, dependencies, next, @prisma/client, react, react-dom, swr, name (+14 more)

### Community 4 - "design.md Page Specs"
Cohesion: 0.14
Nodes (21): Halaman 1.3 Checkout & Konfirmasi (/checkout), Dekat Warung Master Design System, Anterin (Delivery) Option, Ambil Sendiri (Pickup) Delivery Option, Halaman 1.1 Discovery & Warung Terdekat (/), Halaman 1.2 Etalase Warung & Pilih Produk (/warung/[id]), Shared Component 5.1 Merchant Bottom Bar, Halaman 2.2 Modal Alert Pesanan Masuk (+13 more)

### Community 5 - "Discovery/Settings/Nav"
Cohesion: 0.18
Nodes (13): DiscoveryPage(), PengaturanPage(), MerchantBottomBar(), TABS, SettingsClient(), getDefaultMerchantWarung(), getNearbyWarungs(), setWarungOpen() (+5 more)

### Community 6 - "Checkout/Etalase/Cart UI"
Cohesion: 0.21
Nodes (13): CheckoutPage(), StokPage(), WarungEtalasePage(), Counter(), EtalaseClient(), StockClient(), createProduct(), getProductsByWarung() (+5 more)

### Community 7 - "Core Directives & Tech Stack"
Cohesion: 0.12
Nodes (19): Dekat Warung App (Project Directive), Next.js 15.5.20 (App Router), PostgreSQL, Primary Tech Stack (Next.js+Tailwind+Prisma+PostgreSQL), Prisma ORM, Wise Design System (Sage Canvas + Wise Lime), tailwindcss, Custom Request Box (out-of-catalog orders) (+11 more)

### Community 8 - "Dev Dependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, postcss, prisma, @types/node, @types/react, @types/react-dom (+7 more)

### Community 9 - "Layout, Cart & Providers"
Cohesion: 0.18
Nodes (9): metadata, viewport, Providers(), CartContext, CartContextValue, CartItem, CartProvider(), CartState (+1 more)

### Community 10 - "PWA Manifest"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 11 - "Wise Design Tokens"
Cohesion: 0.25
Nodes (8): Canonical 24px Pill Geometry Principle, Heavy Display Typography Weight 900 Principle, Ink Near-Black #0e0f0c, Lime Green as Universal Primary CTA Principle, Sage Canvas Background #e8ebe6, Sage-vs-White Surface Contrast Elevation Principle, Wise Design System (Foundation), Wise Lime Green CTA #9fe870

### Community 13 - "App Icon SVG Brand"
Cohesion: 0.53
Nodes (6): Dekat Warung PWA App Icon (public/icon.svg), "DW" Brand Monogram (Dekat Warung initials), Heavy Typography (font-weight 900, system-ui sans-serif), Ink #0e0f0c (near-black background fill), Rounded Corners rx=40 (~20.8% radius, rounded-3xl aesthetic), Wise Lime #9fe870 (mark foreground color)

### Community 14 - "Git Workflow Protocol"
Cohesion: 0.67
Nodes (4): Auto-Merge & Branch Retention Protocol, Autonomous Workflow Protocol, Feature Branch Development Lifecycle, Git & Branching Workflow (Strict Rules)

## Ambiguous Edges - Review These
- `Haversine Radius <= 200m Rule` → `postgres:16-alpine Image`  [AMBIGUOUS]
  docker-compose.yml · relation: conceptually_related_to

## Knowledge Gaps
- **98 isolated node(s):** `Prisma ORM`, `Wise Design System (Sage Canvas + Wise Lime)`, `Hyper-local Quick Commerce (radius-based)`, `Haversine / PostGIS Geolocation Calculation`, `Custom Request Box (out-of-catalog orders)` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Haversine Radius <= 200m Rule` and `postgres:16-alpine Image`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `devDependencies` connect `Dev Dependencies` to `Runtime Dependencies`, `Core Directives & Tech Stack`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `PWA Warung (Merchant Terminal)` (e.g. with `Shared Component 5.1 Merchant Bottom Bar` and `PWA Pembeli (Customer App)`) actually correct?**
  _`PWA Warung (Merchant Terminal)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Prisma ORM`, `Wise Design System (Sage Canvas + Wise Lime)`, `Hyper-local Quick Commerce (radius-based)` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Buyer & Merchant Page UI` be split into smaller, more focused modules?**
  _Cohesion score 0.13063063063063063 - nodes in this community are weakly interconnected._
- **Should `Docker Compose Infra` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._
- **Should `TSConfig & Next Types` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._