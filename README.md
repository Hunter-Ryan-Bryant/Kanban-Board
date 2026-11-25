# Kanban Board

> A full-stack Kanban board built with React and Supabase. It syncs in real time across tabs and devices, scopes data per user with row-level security, and starts every visitor in a guest workspace with no sign-up.
> A Linear/Asana-inspired task management board built with React and Supabase. Each visitor gets a private workspace through anonymous auth, and PostgreSQL Row Level Security keeps every workspace's data isolated at the database layer.
> A full-stack Kanban task board built with React and Supabase, with drag and drop, filtering, labels, team members, comments and activity history.

![Kanban Board Screenshot](./assets/kanban-screenshot.png)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat&logo=netlify)](https://board-assesment.netlify.app/)
[![Supabase](https://img.shields.io/badge/Supabase-Integrated-3ecf8e?style=flat&logo=supabase)](https://supabase.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com)

---

## ✨ Key Features

- **📋 Four-column board:** To Do, In Progress, In Review and Done, with drag-and-drop between columns.
- **⚡ Real-time sync:** changes from other tabs and devices appear instantly through Supabase `postgres_changes` subscriptions. The app catches up automatically after a reconnect, and a header indicator shows the connection state.
- **👤 Guest sessions:** visitors are signed in anonymously through Supabase Auth, so they can start without an account. The session persists across reloads.
- **🛡️ Per-user data isolation:** every row carries a `user_id`, and row-level security (RLS) policies restrict each user to their own data.
- **🏷️ Labels and assignees:** create color-coded labels and team members, then tag and assign tasks.
- **📅 Due dates:** cards are highlighted as overdue, due today or due within two days.
- **💬 Task details:** a slide-over panel for editing fields inline, with comments and an activity log for each task.
- **🔍 Search and filters:** search titles and descriptions, and filter by label, assignee, priority or due-date urgency.
- **🧯 Resilient updates:** changes appear on screen immediately. If a save fails, the change is rolled back and an error message is shown.
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

- **Frontend:** React 19, Vite, JavaScript (inline style objects, no CSS framework)
- **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime, Row-Level Security)
- **Tooling & Deployment:** oxlint, Netlify, Git / GitHub
- **Frontend:** React 19, Vite, JavaScript, inline component styles
- **Backend / Database:** Supabase (PostgreSQL, Anonymous Auth, Row Level Security)
- **Tooling & Deployment:** oxlint, Netlify, Git / GitHub
- **Frontend:** React 19, Vite, JavaScript, CSS
- **Backend / Database:** Supabase (PostgreSQL, anonymous Auth)
- **Tooling & Deployment:** oxlint, GitHub Actions (lint + build on every push), Netlify

---

## 🏗️ Architecture & Engineering Decisions

- **Supabase instead of a custom backend:** Postgres row-level security enforces authorization at the database layer, so the client talks to Supabase directly with no API server to maintain or secure.
- **Changes show before the save finishes:** the UI updates first and then saves to the database. If the save fails, the change is reverted and an error is shown.
- **Realtime handling:** the app's own writes come back through the subscription too, so incoming rows replace existing ones by id instead of being appended. That prevents duplicates. A remote update to the task being edited doesn't overwrite fields the user is typing in.
- **State management:** custom hooks hold the data and the logic, and components handle presentation:
  - `useWorkspace` covers the session, the four board collections, realtime sync and every write.
  - `useTaskDetail` covers the detail panel.
  - `useTaskFilters` covers search and filters.
- **The open task isn't a separate copy:** the detail panel shows the task from the board's list, plus any edits not yet saved. Remote updates and rollbacks appear in the panel automatically, without overwriting what the user is typing. Text fields save when they lose focus rather than on every keystroke.

### Project structure

```text
src/
├── App.jsx            # connects the hooks to the components
├── hooks/             # useWorkspace, useTaskDetail, useTaskFilters, useToast
├── components/        # Header, Toolbar, Board, TaskCard, TaskDrawer, modals and shared pieces
├── lib/               # constants (columns, priorities, colors) and helpers
├── styles.js          # shared inline style objects
└── supabaseClient.js  # Supabase client and guest session helper
```
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

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- A free [Supabase](https://supabase.com) project
- Node.js 18 or newer
- A free [Supabase](https://supabase.com) project with **Anonymous Sign-Ins enabled** (Authentication → Providers)
- Node.js (v20+ recommended)
- A free [Supabase](https://supabase.com) project with anonymous sign-ins enabled

### 1. Clone and install

```bash
git clone https://github.com/rm9v27j9jv-collab/Kanban-Board.git
git clone https://github.com/Hunter-Ryan-Bryant/Kanban-Board.git
cd Kanban-Board
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:
Create a `.env` file in the project root (it is already git-ignored):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are under **Project Settings → API** in the Supabase dashboard.

### 3. Set up Supabase

1. **Enable anonymous sign-ins:** go to **Authentication → Sign In / Providers** and turn on **Allow anonymous sign-ins**.
2. **Create the tables** the app uses. Each one needs an `id` primary key and a `user_id` column:

   | Table | Columns used by the app |
   |---|---|
   | `tasks` | `title`, `description`, `status` (`todo` / `in_progress` / `in_review` / `done`), `priority` (`low` / `normal` / `high`), `due_date`, `assignee_id`, `created_at` |
   | `team_members` | `name`, `role`, `avatar_color`, `created_at` |
   | `labels` | `name`, `color`, `created_at` |
   | `task_labels` | `task_id`, `label_id` |
   | `task_comments` | `task_id`, `body`, `created_at` |
   | `task_activity` | `task_id`, `action`, `details`, `created_at` |

3. **Enable RLS** on every table, with policies limiting access to rows where `user_id = auth.uid()`.
4. **Enable realtime** for the tables:

   ```sql
   alter publication supabase_realtime
     add table tasks, task_labels, labels, team_members, task_comments, task_activity;
   ```

### 4. Run the app

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # lint with oxlint
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
