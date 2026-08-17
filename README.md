# The Wild Oasis

A multi-hotel operations dashboard built with React and Supabase. It supports
hotel-scoped data access, role-based permissions, room inventory, booking
operations, a draggable room calendar, maintenance blocks, reporting, and
immutable audit logs.

## Features

- Multi-hotel selector with isolated React Query caches
- Owner, manager, front-desk, and finance permission sets
- Supabase Row Level Security as the server-side authorization boundary
- Booking creation, check-in/out, deletion, and drag-to-reschedule workflows
- PostgreSQL date-range constraints that prevent overlapping stays
- Room maintenance blocks that also participate in conflict checks
- URL-synchronized reports with CSV export
- Trigger-based audit history for sensitive business changes
- Dark mode, route-level code splitting, error boundaries, and responsive login

## Local development

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

## Supabase setup

The frontend remains compatible with the original single-hotel schema until
the migration is applied. Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to
back up the project and execute the four SQL files in order. The setup guide
also contains verification queries, role assignment examples, and an RLS test
matrix.

Never disable RLS to fix an authorization problem. Route and button checks are
for user experience; Supabase policies remain the security boundary.

## Main stack

- React 18, React Router, styled-components
- TanStack Query and React Hook Form
- Supabase Auth, Postgres, Storage, RPC, and RLS
- Recharts and date-fns
- Vite and Node's built-in test runner
