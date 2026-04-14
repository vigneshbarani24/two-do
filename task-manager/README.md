# Two-Do — Next.js app

This folder is the deployable Next.js app. Project-level documentation (problem statement, PRD, manual, architecture) lives at the repo root.

- 🏠 **Start here:** [`../README.md`](../README.md)
- 📋 **What & why:** [`../docs/prd.md`](../docs/prd.md)
- 📖 **How to use:** [`../docs/manual.md`](../docs/manual.md)
- 🏗️ **Design:** [`../docs/design.md`](../docs/design.md)

## Quick start

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # production build (Turbopack)
```

## Deploy

```bash
vercel --prod --yes
```

Current production: https://task-manager-eosin-sigma-40.vercel.app

## Source layout

```
src/
├── app/
│   ├── layout.tsx                # Metadata + font setup
│   ├── page.tsx                  # Renders <TaskManager />
│   └── globals.css               # Tailwind 4 + shadcn tokens
├── components/
│   ├── task-manager.tsx          # Owns useReducer, coordinates dialogs + shortcuts
│   ├── task-list.tsx             # Top-level filter + empty state
│   ├── task-tree.tsx             # Recursive; renders TaskItem + children
│   ├── task-item.tsx             # Card, inline edits, checkbox, actions
│   ├── task-form.tsx             # Create dialog
│   ├── move-task-dialog.tsx      # Reparent dialog with cycle prevention
│   ├── time-travel-slider.tsx    # Bottom slider + undo/redo buttons
│   └── ui/                       # shadcn components (base-ui primitives)
└── lib/
    ├── types.ts                  # Task, AppState, HistoryState, Action
    ├── reducer.ts                # reconcileState + historyReducer + helpers
    ├── utils.ts                  # cn, generateId, tree helpers, formatRelativeTime
    └── initial-data.ts           # 4 seed tasks
```

## Tech

- **Next.js 16.2.3** (App Router, Turbopack)
- **React 19.2.4**
- **TypeScript 5** (strict)
- **Tailwind CSS 4**
- **shadcn/ui** on **@base-ui/react** primitives
- **Vercel** deployment

## Things to know before editing

- `AGENTS.md` in this folder flags that Next.js 16 has breaking changes vs older training data. Read `node_modules/next/dist/docs/01-app/` before introducing new Next-specific APIs.
- `shadcn@latest add <component>` is the way to add new UI primitives; don't hand-write wrappers.
- Base-ui's `DropdownMenuTrigger` needs icons in `children`, not inside the `render` element — see `task-item.tsx` for the correct pattern. Doing it wrong breaks click-to-open.
- Every state change must go through `commit()` in `reducer.ts` so the reconciliation + truncation invariants hold. Don't write to `timeline[]` directly.

## Scripts

| Command | Effect |
|---|---|
| `npm run dev` | Dev server on port 3000 (or next free port) |
| `npm run build` | Production build with type-check |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check only |
