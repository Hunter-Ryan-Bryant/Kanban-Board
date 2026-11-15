
# 🚀 Kanban Board

> A high-performance, full-stack task management application designed for seamless team productivity, featuring real-time synchronization, secure authentication, and robust data isolation.

![Kanban Board Screenshot](src="https://github.com/user-attachments/assets/1c196828-2333-4e50-bc3d-a2f2b7015d6a") <!-- Make sure to put your screenshot in an 'assets' folder -->

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat-for-the-badge&logo=vercel)](https://board-assesment.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-for-the-badge)](LICENSE)
[![Supabase Status](https://img.shields.io/badge/Supabase-Integrated-3ecf8e?style=flat-for-the-badge&logo=supabase)](https://supabase.com)

---

## ✨ Key Features

- **🔐 Secure Authentication:** User sign-up, login, and session persistence powered by Supabase Auth.
- **⚡ Real-Time Data Sync:** Instant UI updates across clients leveraging Supabase real-time database subscriptions.
- **🛡️ Row-Level Security (RLS):** Strict database policies ensuring users can only read and mutate their own tasks.
- **🎨 Modern UI/UX:** Built with React, Vite, and Tailwind CSS for a lightning-fast, responsive user experience.
- **🔍 Advanced Filtering & Sorting:** Quickly organize tasks by status, priority, or due date.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, JavaScript, Tailwind CSS
- **Backend / Database:** Supabase (PostgreSQL, Auth, Row-Level Security)
- **Deployment & Tooling:** Netlify, Git / GitHub

---

## 🏗️ Architecture & Engineering Decisions

- **Why Supabase over a custom Node/Express backend?** Chosen to accelerate full-stack delivery while maintaining enterprise-grade security. By leveraging Supabase's built-in PostgreSQL Row-Level Security (RLS), authorization logic is enforced directly at the database layer, eliminating API vulnerabilities.
- **State Management:** Utilized React Context alongside custom hooks to cleanly separate asynchronous data fetching from component rendering logic.

---

## 🏁 Getting Started Locally

Follow these steps to run the project locally on your machine:

### Prerequisites
- Node.js (v18+ recommended)
- A free [Supabase](https://supabase.com) account and project.

### 1. Clone the repository
```bash
git clone [https://github.com/rm9v27j9jv-collab/Kanban-Board.git](https://github.com/rm9v27j9jv-collab/Kanban-Board.git)
cd Kanban-Board
