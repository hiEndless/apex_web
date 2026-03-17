<p align="center">
<h1 align="center">Admin Dashboard Starter Template with Next.js &amp; Shadcn UI</h1>

<div align="center">Built with the Next.js 16 App Router, Tailwind CSS &amp; Shadcn UI components</div>

<br />

<div align="center">
  <a href="https://dub.sh/shadcn-dashboard"><strong>View Demo</strong></a>
</div>
<br />
<div align="center">
  <img src="/public/shadcn-dashboard.png" alt="Shadcn Dashboard Cover" style="max-width: 100%; border-radius: 8px;" />
</div>

## Overview

This is an **admin dashboard starter template** built with **Next.js 16, Shadcn UI, and Tailwind CSS**.

It gives you a production-ready **dashboard UI** with authentication, charts, tables, forms, and a feature-based folder structure, perfect for **SaaS apps, internal tools, and admin panels**.

### Tech Stack

This template uses the following stack:

- Framework - [Next.js 16](https://nextjs.org/16)
- Language - [TypeScript](https://www.typescriptlang.org)
- Error tracking - [Sentry](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy26q2-nextjs&utm_content=github-banner-project-tryfree)
- Styling - [Tailwind CSS v4](https://tailwindcss.com)
- Components - [Shadcn-ui](https://ui.shadcn.com)
- Schema Validations - [Zod](https://zod.dev)
- State Management - [Zustand](https://zustand-demo.pmnd.rs)
- Search params state manager - [Nuqs](https://nuqs.47ng.com/)
- Tables - [Tanstack Data Tables](https://ui.shadcn.com/docs/components/data-table) • [Dice table](https://www.diceui.com/docs/components/data-table)
- Forms - [React Hook Form](https://ui.shadcn.com/docs/components/form)
- Command+k interface - [kbar](https://kbar.vercel.app/)
- Linting - [ESLint](https://eslint.org)
- Pre-commit Hooks - [Husky](https://typicode.github.io/husky/)
- Formatting - [Prettier](https://prettier.io)

_If you are looking for a Tanstack start dashboard template, here is the [repo](https://git.new/tanstack-start-dashboard)._

## Features

- 🧱 Pre-built **admin dashboard layout** (sidebar, header, content area)

- 📊 **Analytics overview** page with cards and charts

- 📋 **Data tables** with server-side search, filter & pagination

- 🔐 **Authentication** & user management via Clerk

- 🏢 **Multi-tenant workspaces** with Clerk Organizations (create, switch, manage teams)

- 💳 **Billing & subscriptions** with Clerk Billing for B2B (plan management, feature gating)

- 🔒 **RBAC navigation system** - Fully client-side navigation filtering based on organization, permissions, and roles

- 🧩 **Shadcn UI components** with Tailwind CSS styling

- 🧠 Feature-based folder structure for scalable projects

- ⚙️ Ready for **SaaS dashboards**, internal tools, and client admin panels

## Use Cases

You can use this Next.js + Shadcn UI dashboard starter to build:

- SaaS admin dashboards

- Internal tools & operations panels

- Analytics dashboards

- Client project admin panels

- Boilerplate for new Next.js admin UI projects

## Pages

| Pages                                                                                                                                                                  | Specifications                                                                                                                                                                                                                                                          |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Signup / Signin](https://shadcn-dashboard.kiranism.dev/auth/sign-in)                                                                                                  | Authentication forms built using the components.                                                                                                                                                                                                                        |
| [Dashboard Overview](https://shadcn-dashboard.kiranism.dev/dashboard)                                                                                                  | Cards with Recharts graphs for analytics. Parallel routes in the overview sections feature independent loading, error handling, and isolated component rendering.                                                                                                       |
| [Product List (Table)](https://shadcn-dashboard.kiranism.dev/dashboard/product)                                                                                        | Tanstack tables with server side searching, filter, pagination by Nuqs which is a Type-safe search params state manager in nextjs                                                                                                                                       |
| [Create Product Form](https://shadcn-dashboard.kiranism.dev/dashboard/product/new)                                                                                     | A Product Form with shadcn form (react-hook-form + zod).                                                                                                                                                                                                                |
| [Profile](https://shadcn-dashboard.kiranism.dev/dashboard/profile)                                                                                                     | User profile management page.                                                                                                                                                                                                                                           |
| [Kanban Board](https://shadcn-dashboard.kiranism.dev/dashboard/kanban)                                                                                                 | A Drag n Drop task management board with dnd-kit and zustand to persist state locally.                                                                                                                                                                                  |
| [Workspaces](https://shadcn-dashboard.kiranism.dev/dashboard/workspaces)                                                                                               | Organization management page.                                                                                                                                                                                                                                           |
| [Team Management](https://shadcn-dashboard.kiranism.dev/dashboard/workspaces/team)                                                                                     | Team management interface.                                                                                                                                                                                                                                              |
| [Billing & Plans](https://shadcn-dashboard.kiranism.dev/dashboard/billing)                                                                                             | Billing management page.                                                                                                                                                                                                                                                |
| [Exclusive Page](https://shadcn-dashboard.kiranism.dev/dashboard/exclusive)                                                                                            | Example of exclusive content page.                                                                                                                                                                                                                                      |
| [Not Found](https://shadcn-dashboard.kiranism.dev/dashboard/notfound)                                                                                                  | Not Found Page Added in the root level                                                                                                                                                                                                                                  |
| [Global Error](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy26q2-nextjs&utm_content=github-banner-project-tryfree) | A centralized error page that captures and displays errors across the application. Integrated with **Sentry** to log errors, provide detailed reports, and enable replay functionality for better debugging.                                                            |

## Feature based organization

```plaintext
src/
├── app/ # Next.js App Router directory
│ ├── (auth)/ # Auth route group
│ │ ├── (signin)/
│ ├── (dashboard)/ # Dashboard route group
│ │ ├── layout.tsx
│ │ ├── loading.tsx
│ │ └── page.tsx
│ └── api/ # API routes
│
├── components/ # Shared components
│ ├── ui/ # UI components (buttons, inputs, etc.)
│ └── layout/ # Layout components (header, sidebar, etc.)
│
├── features/ # Feature-based modules
│ ├── feature/
│ │ ├── components/ # Feature-specific components
│ │ ├── actions/ # Server actions
│ │ ├── schemas/ # Form validation schemas
│ │ └── utils/ # Feature-specific utilities
│ │
├── lib/ # Core utilities and configurations
│ ├── auth/ # Auth configuration
│ ├── db/ # Database utilities
│ └── utils/ # Shared utilities
│
├── hooks/ # Custom hooks
│ └── use-debounce.ts
│
├── stores/ # Zustand stores
│ └── dashboard-store.ts
│
└── types/ # TypeScript types
└── index.ts
```

## Getting Started

> [!NOTE]  
> This admin dashboard starter uses **Next.js 16 (App Router)** with **React 19** and **Shadcn UI**. Follow these steps to run it locally:

Clone the repo:

```
git clone https://github.com/Kiranism/next-shadcn-dashboard-starter.git
```

- `bun install`
- Create a `.env.local` file by copying the example environment file:
  `cp env.example.txt .env.local`
- Add the required environment variables to the `.env.local` file.
- `bun run dev`

##### Environment Configuration Setup

To configure the environment for this project, refer to the `env.example.txt` file. This file contains the necessary environment variables required for authentication and error tracking.

##### Clerk Setup

For detailed instructions on configuring Clerk authentication (including organizations/workspaces/teams), please refer to [clerk_setup.md](./docs/clerk_setup.md).

You should now be able to access the application at http://localhost:3000.

> [!WARNING]
> After cloning or forking the repository, be cautious when pulling or syncing with the latest changes, as this may result in breaking conflicts.

Cheers! 🥂

<!--

SEO keywords:

nextjs admin dashboard, nextjs dashboard template, shadcn ui dashboard,

admin dashboard starter, dashboard ui template, nextjs shadcn admin panel,

react admin dashboard, tailwind css admin dashboard

-->

## Star History

<a href="https://www.star-history.com/#Kiranism/next-shadcn-dashboard-starter&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Kiranism/next-shadcn-dashboard-starter&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Kiranism/next-shadcn-dashboard-starter&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Kiranism/next-shadcn-dashboard-starter&type=date&legend=top-left" />
 </picture>
</a>
