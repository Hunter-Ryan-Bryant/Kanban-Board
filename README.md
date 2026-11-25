# 🚀 Kanban Board

> A full-stack Kanban board built with React and Supabase. It syncs in real time across tabs and devices, scopes data per user with row-level security, and starts every visitor in a guest workspace with no sign-up.

![Kanban Board Screenshot](./assets/kanban-screenshot.png)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat&logo=netlify)](https://board-assesment.netlify.app/)
[![Supabase](https://img.shields.io/badge/Supabase-Integrated-3ecf8e?style=flat&logo=supabase)](https://supabase.com)

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

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, JavaScript (inline style objects, no CSS framework)
- **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime, Row-Level Security)
- **Tooling & Deployment:** oxlint, Netlify, Git / GitHub

---

## 🏗️ Architecture & Engineering Decisions

- **Supabase instead of a custom backend:** Postgres row-level security enforces authorization at the database layer, so the client talks to Supabase directly with no API server to maintain or secure.
- **Changes show before the save finishes:** the UI updates first and then saves to the database. If the save fails, the change is reverted and an error is shown.
- **Realtime handling:** the app's own writes come back through the subscription too, so incoming rows replace existing ones by id instead of being appended. That prevents duplicates. A remote update to the task being edited doesn't overwrite fields the user is typing in.
- **State management:** all state lives in a single top-level component ([`src/App.jsx`](src/App.jsx)), using React hooks (`useState`, `useMemo`, `useRef`). Text fields save when they lose focus rather than on every keystroke.

---

## 🏁 Getting Started Locally

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- A free [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/rm9v27j9jv-collab/Kanban-Board.git
cd Kanban-Board
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

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
```
