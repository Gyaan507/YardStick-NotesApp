# YardStick-NotesApp SaaS 📝

<div align="center">

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

**A full-stack, multi-tenant SaaS Notes Application built with a modern JavaScript stack and deployed on Vercel.**

[Live Demo](#-live-demo) • [Features](#-core-features) • [Tech Stack](#-technology-stack) • [Setup](#-local-development-setup) • [API Docs](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [🚀 Live Demo](https://yard-stick-notes-app-lf64.vercel.app/login)


---

## 🚀 Live Demo

<div align="center">

| Service | URL |
|---------|-----|
| **Frontend Application** | **`[YOUR_FRONTEND_URL]`** |
| **Backend Health Status** | **`[YOUR_BACKEND_URL]/health`** |

</div>

---

## ✨ Core Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🏢 **Multi-Tenancy Architecture** | Securely supports multiple companies with strict data isolation |
| 🔐 **User Authentication** | JWT-based login and signup system for new tenants |
| 👥 **Role-Based Access Control** | Admin and Member roles with different permissions |
| 💳 **Subscription Gating** | Free plan (3 notes) and Pro plan (unlimited notes) |
| 📝 **Full CRUD Functionality** | Create, Read, Update, and Delete notes |
| 📧 **User Invites** | Admins can invite new members to join their tenant |

</div>

### 🔑 Role Permissions

- **👑 Admin**: Can invite new users and upgrade the subscription
- **👤 Member**: Can only manage notes

---

## 🛠️ Technology Stack

<div align="center">

| **Frontend** | **Backend** | **Deployment & Database** |
|--------------|-------------|---------------------------|
| React.js | Node.js | Vercel |
| React Router | Express.js | PostgreSQL (on Neon) |
| Tailwind CSS | `node-postgres` (pg) | Git & GitHub |
| Axios | JWT (jsonwebtoken) | |
| React Context API | Zod (for validation) | |

</div>

---

## 🏛️ Architectural Decisions

### 🏢 Multi-Tenancy Strategy

> **Approach**: This application uses a **shared schema with a `tenant_id` column** for multi-tenancy.

**💡 Reasoning**: This model was chosen for its simplicity, cost-effectiveness, and ease of development. It's a robust and common pattern for SaaS applications where tenants have similar data schemas.

**🔧 Implementation**: Every table holding tenant-specific data (e.g., `users`, `notes`) has a mandatory `tenant_id` foreign key. All backend API queries are programmatically filtered by the `tenant_id` of the authenticated user, which is extracted from their JWT on every request. This ensures that a user from one company can **never** access data belonging to another.

---

## 📡 API Documentation

<div align="center">

| Method | Endpoint | Description | 🔒 Protected | 👑 Admin Only |
|--------|----------|-------------|-------------|---------------|
| `GET` | `/health` | Checks the health status of the API | ❌ | ❌ |
| `POST` | `/auth/login` | Authenticates a user and returns a JWT | ❌ | ❌ |
| `POST` | `/users/signup` | Registers a new user and a new tenant | ❌ | ❌ |
| `POST` | `/users/invite` | Invites a new user to the admin's tenant | ✅ | ✅ |
| `GET` | `/notes` | Fetches all notes for the current tenant | ✅ | ❌ |
| `POST` | `/notes` | Creates a new note for the current tenant | ✅ | ❌ |
| `PUT` | `/notes/:id` | Updates a specific note | ✅ | ❌ |
| `DELETE` | `/notes/:id` | Deletes a specific note | ✅ | ❌ |
| `POST` | `/tenants/:slug/upgrade` | Upgrades a tenant's plan to "Pro" | ✅ | ✅ |

</div>

---

## 💻 Local Development Setup

### 📋 Prerequisites

- Node.js (v18 or later)
- npm
- Git
- A free PostgreSQL database URL (e.g., from [Neon](https://neon.tech/))

### 🚀 Installation

#### 1️⃣ **Clone the Repository**
\`\`\`bash
git clone https://github.com/Gyaan507/YardStick-NotesApp.git
cd YardStick-NotesApp
\`\`\`

#### 2️⃣ **Setup the Backend**
\`\`\`bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create a .env file and add your variables
# DATABASE_URL="your_postgresql_connection_string"
# JWT_SECRET="your_super_secret_and_long_string"

# Create DB tables and seed with test data
node db-setup.js
node seed.js

# Start the backend server
node index.js
\`\`\`
*Backend will run on `http://localhost:3001`*

#### 3️⃣ **Setup the Frontend** *(in a new terminal)*
\`\`\`bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
\`\`\`
*Frontend will run on `http://localhost:3000`*

---

## 👥 Test Accounts

The following test accounts are pre-seeded into the database. The password for all accounts is **`password`**.

<div align="center">

| 📧 Email | 👤 Role | 🏢 Tenant |
|----------|---------|-----------|
| `admin@acme.test` | **👑 Admin** | Acme Inc. |
| `user@acme.test` | 👤 Member | Acme Inc. |
| `admin@globex.test` | **👑 Admin** | Globex Corporation |
| `user@globex.test` | 👤 Member | Globex Corporation |

</div>

---

<div align="center">

**Built with ❤️ by [Gyaan507](https://www.linkedin.com/in/gyaneshwar-kumar-8b6250228/)**

⭐ **Star this repo if you found it helpful!** ⭐

</div>
