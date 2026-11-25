# 🚀 Kanban Board

> A full-stack Kanban task board built with React and Supabase, with drag and drop, filtering, labels, team members, comments and activity history.

![Kanban Board Screenshot](./assets/kanban-screenshot.png)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat-for-the-badge&logo=vercel)](https://board-assesment.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-for-the-badge)](LICENSE)
[![Supabase Status](https://img.shields.io/badge/Supabase-Integrated-3ecf8e?style=flat-for-the-badge&logo=supabase)](https://supabase.com)

---

## ✨ Key Features

- **🖱️ Drag-and-Drop Board:** Move tasks between columns with native HTML5 drag and drop.
- **🔍 Search & Filtering:** Search tasks by text and filter by priority, due-date urgency, assignee, or label.
- **🏷️ Labels & Team Members:** Create color-coded labels and team members, then tag and assign tasks.
- **💬 Comments & Activity Log:** Each task has a detail view with a comment thread and a history of changes.
- **📅 Due-Date Tracking:** Tasks are flagged as overdue or due soon based on their due date.
- **🔐 Guest Sessions:** Visitors are signed in automatically with Supabase anonymous auth, and the session persists across reloads, so anyone can try the board without creating an account.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, JavaScript, CSS
- **Backend / Database:** Supabase (PostgreSQL, anonymous Auth)
- **Tooling & Deployment:** oxlint, GitHub Actions (lint + build on every push), Netlify

---

## 🏗️ Architecture & Engineering Decisions

- **Why Supabase over a custom Node/Express backend?** It provides a hosted PostgreSQL database and authentication out of the box, which let me focus on the board's features instead of server setup.
- **Anonymous auth:** `getOrCreateGuestSession()` in `src/supabaseClient.js` reuses an existing session or signs the visitor in anonymously, so every visitor gets their own identity with zero sign-up friction.
- **State management:** Board state lives in React `useState` hooks in `App.jsx`, with tasks, labels, team members and task-label links loaded from Supabase in parallel on startup.
- **Planned improvements:** split `App.jsx` into smaller components and custom hooks, add real-time sync with Supabase subscriptions, and add email sign-up alongside guest mode.

---

## 🏁 Getting Started Locally

### Prerequisites

- Node.js (v20+ recommended)
- A free [Supabase](https://supabase.com) project with anonymous sign-ins enabled

### 1. Clone the repository

```bash
git clone https://github.com/rm9v27j9jv-collab/Kanban-Board.git
cd Kanban-Board
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
