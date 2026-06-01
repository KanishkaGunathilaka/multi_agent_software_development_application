# Research Assistant

A lightweight TypeScript service that integrates with an LLM (Ollama) and a vector database.  
It demonstrates solid configuration handling, error safety, and a clear public API surface.

## 📦 Project Setup

| Step | Command |
|------|---------|
| **1️⃣ Install dependencies** | `npm ci` (or `npm install` if `package-lock.json` is missing) |
| **2️⃣ Build the sources** | `npm run build` – compiles `src/**/*.ts` → `dist/` |
| **3️⃣ Run the app** | `npm start` – launches the compiled server (`dist/server.js`) |
| **4️⃣ Run in development** | `npm run dev` – uses `tsx` for on‑the‑fly compilation with hot‑reload |
| **5️⃣ Lint / type‑check** | `npm run lint` & `npm run typecheck` |
| **6️⃣ Test** | `npm test` – runs Jest unit tests |

### Required Environment Variables

The configuration loader validates the variables described below (see `src/config/schemas.ts` for the source of truth). Provide them via a **`.env`** file at the project root, the host environment, or a **`config.json`** file.

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Execution mode (`development`, `production`, …) | `development` |
| `PORT` | HTTP port (defaults to `3000`) | `8080` |
| `OLLAMA_BASE_URL` | Ollama server URL (defaults to `http://localhost:11434`) | `https://my-ollama.cloud` |
| `OLLAMA_MODEL` | Model to use – defaults to `llama3.2` | `mistral` |
| `VECTOR_DB_URL` | URL of the vector DB service | `https://example.pinecone.io` |
| `LOG_LEVEL` | Minimum log level (`error`, `warn`, `info`, `debug`) | `info` |
| `ENABLE_EXPERIMENTAL` | Feature‑toggle (`true`/`false`) | `true` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port (default `5432`) | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password (secret) | `secret` |
| `DB_NAME` | PostgreSQL database name | `research_assistant` |

> **⚠️ Security note** – Never commit real secrets. Keep a clean `.env.example` template and add `.env` to `.gitignore`.

## � Environment Configuration & Application Startup

### Prerequisites

Before running the application, ensure you have:

- **Node.js** (v18 or higher) – [Download](https://nodejs.org/)
- **npm** (v9 or higher) – Comes with Node.js
- **PostgreSQL** (v12 or higher) – [Download](https://www.postgresql.org/download/) or use Docker
- **Ollama** – [Download](https://ollama.ai/) for local LLM or configure a remote URL
- **Qdrant Vector DB** (optional) – [Download](https://qdrant.tech/) or use cloud service

### Step 1️⃣: Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd multi_agent_software_development_application

# Install dependencies
npm ci
```

### Step 2️⃣: Configure Environment Variables

**Option A: Using `.env` file (Recommended)**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Option B: Using environment variables directly**

```bash
export NODE_ENV=development
export PORT=3000
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=llama3.2
export VECTOR_DB_URL=http://localhost:6333
export LOG_LEVEL=info
export DB_HOST=localhost
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=research_assistant
```

### Step 3️⃣: Set Up Backend Services

#### PostgreSQL Database

```bash
# Using Docker (recommended)
docker run --name postgres-research \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=research_assistant \
  -p 5432:5432 \
  -d postgres:15-alpine

# Or use local installation
createdb -U postgres research_assistant
```

#### Qdrant Vector Database

```bash
# Using Docker
docker run --name qdrant \
  -p 6333:6333 \
  -d qdrant/qdrant

# Or download and run locally from https://qdrant.tech/
```

#### Ollama LLM Server (Local)

```bash
# Download and start Ollama
# https://ollama.ai

# Pull a model
ollama pull llama3.2

# Start Ollama server (runs on http://localhost:11434)
ollama serve
```

### Step 4️⃣: Run the Application

#### 🔧 Development Mode (Hot Reload)

```bash
npm run dev
```

- **Features**: Auto-recompilation, live reload, detailed logging
- **Output**: Server running on `http://localhost:3000`
- **Logs**: Real-time debug output in terminal

#### ⚡ Production Mode

```bash
# Build the TypeScript
npm run build

# Start the server
npm start
```

- **Features**: Optimized build, minimal bundle size
- **Output**: Server running on configured `PORT` (default `3000`)

#### 🧪 Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/tests/example.test.ts
```

#### 📝 Code Quality

```bash
# Type-check (no compilation)
npm run typecheck

# Lint code
npm run lint
```

### Step 5️⃣: Verify the Application

Once running, test the application:

```bash
# Check health endpoint
curl http://localhost:3000/health

# Test research endpoint
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"query": "What is TypeScript?"}'
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port already in use** | Change `PORT` in `.env` or kill the process on that port |
| **Database connection failed** | Verify PostgreSQL is running and `DB_*` variables are correct |
| **Ollama connection error** | Ensure Ollama is running (`ollama serve`) and `OLLAMA_BASE_URL` is correct |
| **Vector DB connection failed** | Check Qdrant is running on the configured `VECTOR_DB_URL` |
| **Module not found** | Run `npm ci` to reinstall dependencies |

## �🛠️ Architecture Overview
