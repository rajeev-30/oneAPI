<div align="center">

# ⚡ oneAPI

### The Universal AI Gateway — One API, Every Model

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Access **multiple AI models** from **different providers** through a single, unified, OpenAI-compatible API.
Stop juggling multiple API keys, SDKs, and billing dashboards.

[Getting Started](#-getting-started) •
[Features](#-features) •
[Architecture](#-architecture) •
[API Docs](#-api-documentation) •
[Contributing](#-contributing)

---

</div>

## 🚀 What is oneAPI?

**oneAPI** is an open-source AI model gateway and routing platform — similar to [OpenRouter](https://openrouter.ai/). It acts as a single entry point to interact with hundreds of large language models (LLMs) from providers like OpenAI, Anthropic, Google, Meta, Mistral, and more.

```
Your App ──► oneAPI API ──► Best Provider (OpenAI, Anthropic, Google...)
                 │
                 ├── Smart Routing
                 ├── Automatic Fallbacks
                 ├── Cost Optimization
                 └── Unified Billing
```

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 **Unified API** | Single OpenAI-compatible endpoint for all models |
| 🧠 **Smart Routing** | Route to the cheapest, fastest, or most reliable provider |
| 🔄 **Auto Fallbacks** | Automatically retry with another provider if one fails |
| 💰 **Cost Management** | Per-key budgets, real-time usage tracking, cost comparison |
| 🔐 **API Key Management** | Create multiple keys with scoped permissions & rate limits |
| 🏢 **Organizations** | Teams, roles, shared billing, and org-level settings |
| 💬 **Chat Playground** | Built-in chat UI to test and compare models |
| 📊 **Analytics Dashboard** | Track usage, costs, latency, and errors in real-time |
| 🔒 **Privacy Controls** | Zero-retention, no-logging data policies per request |
| 📡 **Streaming (SSE)** | Full streaming support via Server-Sent Events |
| 🪝 **Webhooks** | Get notified on budget thresholds, errors, and more |
| ⚙️ **Presets** | Save routing strategies and parameter configs |

## 🏗 Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express, TypeScript |
| **Frontend** | Next.js 14+, React, Tailwind CSS |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT + OAuth (Google) |
| **Payments** | Stripe (credits & billing) |
| **Caching** | Redis (rate limiting, session cache) |
| **Deployment** | vercel |

### Project Structure

```
oneAPI/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── config/             # DB, env, constants
│   │   ├── controllers/        # Route handlers
│   │   ├── middlewares/        # Auth, rate-limit, error handling
│   │   ├── models/             # Mongoose schemas (16 models)
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic & routing engine
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # Helpers, token counting, hashing
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Entry point
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                   # Next.js 14+ App
│   ├── src/
│   │   ├── app/                # App router pages
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # API client, utils
│   │   ├── hooks/              # Custom React hooks
│   │   └── styles/             # Global styles
│   ├── .env.local
│   └── package.json
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

### Database Schema Overview

```
User ──┬── API Keys
       ├── Organizations ── Org Members
       ├── Apps
       ├── Wallets ── Transactions
       ├── Chat Threads ── Messages
       ├── Presets
       └── Webhooks

Provider ──► ProviderModel (join) ◄── Model

ApiRequestLog (central hub linking all entities)
RateLimitRule (polymorphic scoping)
```

> See [`docs/SCHEMAS.md`](docs/SCHEMAS.md) for full schema definitions and relationships.

## 📦 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** >= 7.0 (local or Atlas)
- **Redis** >= 7.0 (for rate limiting)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/oneAPI.git
cd oneAPI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/oneAPI
CLIENT_URL=http://localhost:3000

# Auth
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redis
REDIS_URL=redis://localhost:6379

# Provider API Keys
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_AI_API_KEY=xxx
```

Start the dev server:

```bash
npm run dev
# ✅ Server running on http://localhost:8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=oneAPI
```

Start the dev server:

```bash
npm run dev
# ✅ Frontend running on http://localhost:3000
```

### 4. Docker (Optional)

```bash
docker-compose up -d
# Starts backend, frontend, MongoDB, and Redis
```

## 📡 API Documentation

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

All API requests require an API key in the `Authorization` header:

```bash
Authorization: Bearer sk-oneapi-v1-xxxxxxxxx
```

### Core Endpoints

#### Chat Completions (OpenAI-Compatible)

```bash
POST /api/v1/chat/completions
```

```json
{
  "model": "openai/gpt-4o",
  "messages": [
    { "role": "user", "content": "Hello, how are you?" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}
```

#### Models

```bash
GET    /api/v1/models              # List all available models
GET    /api/v1/models/:slug        # Get model details
```

#### API Keys

```bash
POST   /api/v1/keys                # Create new API key
GET    /api/v1/keys                # List your API keys
PATCH  /api/v1/keys/:id            # Update API key
DELETE /api/v1/keys/:id            # Revoke API key
```

#### Usage & Analytics

```bash
GET    /api/v1/usage               # Get usage stats
GET    /api/v1/usage/costs         # Cost breakdown by model
GET    /api/v1/usage/activity      # Request activity timeline
```

#### Auth

```bash
POST   /api/v1/auth/register       # Register new account
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/logout         # Logout
POST   /api/v1/auth/refresh        # Refresh token
GET    /api/v1/auth/me             # Get current user
```

#### Organizations

```bash
POST   /api/v1/orgs                # Create organization
GET    /api/v1/orgs                # List your organizations
POST   /api/v1/orgs/:id/members    # Invite member
DELETE /api/v1/orgs/:id/members/:uid # Remove member
```

#### Wallet & Billing

```bash
GET    /api/v1/wallet              # Get balance
POST   /api/v1/wallet/deposit      # Add credits (Stripe)
GET    /api/v1/wallet/transactions  # Transaction history
```

> For full API docs, see [`docs/API.md`](docs/API.md) or visit `/api-docs` (Swagger UI) when running locally.

## 🛣️ Routing Strategies

oneAPI supports multiple routing strategies for choosing the optimal provider:

| Strategy | Description |
|---|---|
| `default` | Uses provider priority rankings |
| `cheapest` | Routes to the lowest-cost provider |
| `fastest` | Routes to the lowest-latency provider |
| `round-robin` | Distributes evenly across providers |
| `fallback` | Tries providers in order until one succeeds |

Set via the `X-Routing-Strategy` header or in your preset config:

```bash
curl -X POST http://localhost:8000/api/v1/chat/completions \
  -H "Authorization: Bearer sk-oneapi-v1-xxx" \
  -H "X-Routing-Strategy: cheapest" \
  -d '{"model": "meta-llama/llama-3-70b", "messages": [...]}'
```

## 🧪 Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## 🗺️ Roadmap

- [x] Core API with OpenAI-compatible endpoint
- [x] Multi-provider routing engine
- [x] API key management with scoped permissions
- [x] Wallet & credit system with Stripe
- [x] Organization & team support
- [ ] Chat playground UI
- [ ] Real-time analytics dashboard
- [ ] Model comparison tool
- [ ] Bring Your Own Key (BYOK) support
- [ ] Plugin / extension system
- [ ] Rate limiting with Redis
- [ ] WebSocket support for streaming
- [ ] Admin panel for managing providers & models
- [ ] SDKs (Python, Node.js, Go)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style (formatting, semicolons, etc.)
refactor: Code refactoring
test:     Adding or updating tests
chore:    Maintenance tasks
```

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Inspired by [OpenRouter](https://openrouter.ai/)
- Built with [Express](https://expressjs.com/), [Next.js](https://nextjs.org/), [MongoDB](https://www.mongodb.com/)
- Icons by [Lucide](https://lucide.dev/)

---

<div align="center">

**Built with ❤️ by [Rajeev](https://github.com/rajeev-30)**

⭐ Star this repo if you find it useful!

</div>