# Project Rules & Autonomous Execution Directives

## Core Directives
- App Name: Dekat Warung (Hyper-local Quick Commerce)
- Primary Stack: Next.js 15.5.20 (App Router), Tailwind CSS, Prisma ORM, PostgreSQL.
- Design System: Wise Design System (Sage Canvas #e8ebe6, Wise Lime #9fe870, Heavy Typography weight 900, rounded-3xl / 24px radius).
- Refer to `prd.md` for business logic, `design.md` for UI/CSS token guidelines, and `schema.prisma` for the database layer.

## Git & Branching Workflow (STRICT RULES)
- **Do NOT commit directly onto `main` or `master` during active development.**
- Development lifecycle protocol:
  1. Check current branch (`git branch --show-current`).
  2. Create and switch to a feature branch: `git checkout -b feat/dekat-warung-mvp`.
  3. Make atomic, incremental commits on the feature branch using Conventional Commits format (`feat:`, `fix:`, `chore:`).
  4. Perform all type-checks (`npx tsc --noEmit`) and build tests (`npm run build`) exclusively on the feature branch.

- **Auto-Merge & Branch Retention Protocol:**
  1. Once `npm run build` achieves 100% success without errors on the feature branch, switch to `main`:
     `git checkout main`
  2. Merge the feature branch into `main` using non-fast-forward merge to preserve history:
     `git merge feat/dekat-warung-mvp --no-ff -m "feat: complete and merge dekat warung mvp"`
  3. **CRITICAL:** Do NOT delete the feature branch after merging (do NOT execute `git branch -d` or `git branch -D`). Keep both `main` and `feat/dekat-warung-mvp` intact.

## Autonomous Workflow Protocol
1. Read all context files (`prd.md`, `design.md`, `schema.prisma`) before writing code.
2. Initialize Git repository if needed and immediately switch to feature branch `feat/dekat-warung-mvp`.
3. Execute tasks in sequence: Setup -> Database/Prisma -> Server Actions/API -> Shared Components -> Buyer PWA -> Merchant Terminal.
4. Automatically run type-checks (`npx tsc --noEmit`) and build checks (`npm run build`) after major updates.
5. If an error occurs, auto-correct the code on the feature branch until `npm run build` succeeds without warnings/errors.
6. Execute the **Auto-Merge & Branch Retention Protocol** to bring changes into `main` while keeping the feature branch alive.
7. Do NOT ask for user confirmation for bash commands, file creations, or git operations. Complete the entire scope end-to-end.