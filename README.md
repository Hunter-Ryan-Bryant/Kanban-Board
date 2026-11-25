# Kanban Board

> A Linear/Asana-inspired task management board built with React and Supabase. Each visitor gets a private workspace through anonymous auth, and PostgreSQL Row Level Security keeps every workspace's data isolated at the database layer.
> A full-stack Kanban task board built with React and Supabase, with drag and drop, filtering, labels, team members, comments and activity history.

![Kanban Board Screenshot](./assets/kanban-screenshot.png)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat&logo=netlify)](https://board-assesment.netlify.app/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com)

---

## ✨ Key Features

- **🗂️ Four workflow columns:** To Do, In Progress, In Review and Done, with native HTML5 drag-and-drop to move tasks between them.
- **🔐 Instant private workspace:** No sign-up required. Each visitor is signed in with Supabase Anonymous Auth, and the session persists across reloads.
- **🛡️ Row Level Security (RLS):** Policies on all six tables ensure a session can only read and change its own data.
- **🔍 Search and filtering:** Live search plus filters for priority, due-date urgency, assignee and label.
- **📅 Due-date tracking:** Tasks show "Overdue", "Due Today" or "Due in Nd" badges, and a summary bar counts total, completed and overdue tasks.
- **🏷️ Labels and team members:** Create custom color-coded labels and team members, then attach them to tasks.
- **💬 Task detail drawer:** A slide-over panel with threaded comments and an automatic activity log of every change.
- **🖱️ Drag-and-Drop Board:** Move tasks between columns with native HTML5 drag and drop.
- **🔍 Search & Filtering:** Search tasks by text and filter by priority, due-date urgency, assignee, or label.
- **🏷️ Labels & Team Members:** Create color-coded labels and team members, then tag and assign tasks.
- **💬 Comments & Activity Log:** Each task has a detail view with a comment thread and a history of changes.
- **📅 Due-Date Tracking:** Tasks are flagged as overdue or due soon based on their due date.
- **🔐 Guest Sessions:** Visitors are signed in automatically with Supabase anonymous auth, and the session persists across reloads, so anyone can try the board without creating an account.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, JavaScript, inline component styles
- **Backend / Database:** Supabase (PostgreSQL, Anonymous Auth, Row Level Security)
- **Tooling & Deployment:** oxlint, Netlify, Git / GitHub
- **Frontend:** React 19, Vite, JavaScript, CSS
- **Backend / Database:** Supabase (PostgreSQL, anonymous Auth)
- **Tooling & Deployment:** oxlint, GitHub Actions (lint + build on every push), Netlify

---

## 🏗️ Architecture & Engineering Decisions

- **Why Supabase instead of a custom Node/Express backend?** It let me ship a full-stack app quickly without giving up security. Authorization lives in PostgreSQL RLS policies, so even a request that bypasses the UI can't touch another session's rows.
- **Why anonymous auth?** Visitors (including recruiters clicking the demo link) can try the board immediately without creating an account, while still getting an isolated workspace.
- **Data model:** Six normalized tables: `tasks`, `labels`, `task_labels` (many-to-many join), `team_members`, `task_comments` and `task_activity`.
- **State:** Board data is loaded from Supabase into React state (`useState`) and updated after each successful write.
- **Why Supabase over a custom Node/Express backend?** It provides a hosted PostgreSQL database and authentication out of the box, which let me focus on the board's features instead of server setup.
- **Anonymous auth:** `getOrCreateGuestSession()` in `src/supabaseClient.js` reuses an existing session or signs the visitor in anonymously, so every visitor gets their own identity with zero sign-up friction.
- **State management:** Board state lives in React `useState` hooks in `App.jsx`, with tasks, labels, team members and task-label links loaded from Supabase in parallel on startup.
- **Planned improvements:** split `App.jsx` into smaller components and custom hooks, add real-time sync with Supabase subscriptions, and add email sign-up alongside guest mode.

---

## 🏁 Getting Started Locally

### Prerequisites

- Node.js 18 or newer
- A free [Supabase](https://supabase.com) project with **Anonymous Sign-Ins enabled** (Authentication → Providers)
- Node.js (v20+ recommended)
- A free [Supabase](https://supabase.com) project with anonymous sign-ins enabled

### 1. Clone the repository

```bash
git clone https://github.com/Hunter-Ryan-Bryant/Kanban-Board.git
cd Kanban-Board
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (it is already git-ignored):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the database

In your Supabase project, create the six tables listed above and enable RLS on each, with policies that restrict rows to `auth.uid()`.

### 4. Run it

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # lint with oxlint
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Supabase keys

Copy `.env.example` to `.env` and fill in the values from your Supabase project's API settings:

```bash
cp .env.example .env
```

### 4. Start the dev server

```bash
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

---

## 📜 Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run lint` | Lint the code with oxlint |
| `npm run preview` | Preview the production build |

---

## 📄 License

[MIT](LICENSE)
