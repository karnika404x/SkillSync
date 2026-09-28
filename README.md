# SkillSync — AI Talent & Project Marketplace (FastAPI Backend & Frontend)

SkillSync is an AI-powered internal talent and project marketplace that connects employee skills, interests, and experience with project opportunities across enterprise teams.

---

## 🚀 Quick Start

### 1. Requirements
- **Python 3.10+** (Python 3.14 compatible)

### 2. Setup & Virtual Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run Backend Server
```bash
python run_backend.py
```
*Or using uvicorn directly:*
```bash
uvicorn app.main:app --reload --port 8000
```

Once running:
- **Web App Interface**: [http://localhost:8000/](http://localhost:8000/)
- **Interactive OpenAPI (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 4. Run Automated Test Suite
```bash
pytest
```

---

## 🔐 Demo Login Credentials

| Employee ID | Password | Role Options |
| :--- | :--- | :--- |
| `EMP-1001` | `demo123` | Employee |
| `EMP-1002` | `demo123` | Project Manager |
| `EMP-1003` | `demo123` | HR/Admin |

---

## 🏗 Backend Architecture

```
SkillSync_Prototype/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app instance, CORS middleware, static router
│   ├── config.py              # Application settings (Pydantic Settings v2)
│   ├── database.py            # SQLAlchemy database engine, session local & auto-seeder
│   ├── models.py              # SQLAlchemy ORM models (User, Project, Application, LearningProgress)
│   ├── schemas.py             # Pydantic serialization models & schemas
│   ├── auth.py                # JWT token handling, bcrypt hashing & RBAC dependencies
│   ├── ai_matcher.py          # AI Skill Matching Engine (TF-IDF vector similarity + multi-factor scoring)
│   └── routers/
│       ├── auth.py            # Auth routes (/api/auth/login, /me, /reset-demo)
│       ├── employees.py       # Workforce, hidden talent & upskilling endpoints
│       ├── projects.py        # Project marketplace CRUD
│       ├── matching.py        # AI shortlist generation & match explanation
│       └── applications.py    # Express interest & application tracking
├── tests/
│   ├── conftest.py            # Pytest test fixtures & in-memory/isolated SQLite setup
│   ├── test_auth.py           # Unit tests for authentication & JWT
│   ├── test_employees.py      # Unit tests for employee & upskilling routes
│   ├── test_matching.py       # Unit tests for AI Skill Matcher & shortlist calculation
│   └── test_projects.py       # Unit tests for project marketplace CRUD & permissions
├── index.html                 # Interactive Web UI with backend REST API integration & fallback
├── requirements.txt           # Python dependency requirements
├── run_backend.py             # Python launcher script
└── README.md                  # Complete documentation
```

---

## 📡 API Endpoint Overview

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with `employee_id`, `password`, and optional `role`. Returns JWT token.
- `GET /api/auth/me`: Get profile details of currently authenticated user.
- `POST /api/auth/reset-demo`: Reset SQLite database tables to initial demo seed data.

### 💼 Project Marketplace (`/api/projects`)
- `GET /api/projects`: List project opportunities (supports `search`, `department`, `status_filter`).
- `POST /api/projects`: Create a new project (Requires `Project Manager` or `HR/Admin` role).
- `GET /api/projects/{id}`: Retrieve project by ID.
- `PUT /api/projects/{id}`: Update project details.
- `DELETE /api/projects/{id}`: Delete a project (Requires `Project Manager` or `HR/Admin` role).

### 🤖 AI Skill Matching Engine (`/api/matching`)
- `POST /api/matching/shortlist`: Run AI matching engine for a project ID, returning a ranked shortlist of candidates with explainable score breakdowns.
- `GET /api/matching/explain`: Returns granular breakdown (exact skill overlap, TF-IDF vector text similarity, experience score, interest alignment score, performance score).

### 👥 Employees & Talent Discovery (`/api/employees`)
- `GET /api/employees`: List workforce employee profiles.
- `GET /api/employees/hidden-talent`: Discover employees with hidden or secondary skills beyond job titles.
- `GET /api/employees/upskilling`: View skill gap matrix across projects with actionable learning tasks.
- `POST /api/employees/upskilling`: Update learning progress status (`Not Started`, `In Progress`, `Completed`).

### 📩 Project Applications (`/api/applications`)
- `POST /api/applications`: Express interest in a project.
- `GET /api/applications`: Get application history for current user or project.

---

## 📊 AI Matching Formula Weights

```
Overall Score (0–100%) = 
    Skill Overlap Score       (50%)  +
    TF-IDF Vector Similarity   (15%)  +
    Experience Ratio          (15%)  +
    Interest Alignment        (10%)  +
    Performance & Knowledge   (10%)
```

---

## 🛢 Customizing Database & AI Providers

The backend configuration is handled via environment variables in `app/config.py`:

- **Database**: Defaults to SQLite (`sqlite:///./skillsync.db`). Set `DATABASE_URL=postgresql://user:pass@localhost:5432/skillsync` for production PostgreSQL.
- **AI Provider**: Defaults to `hybrid` (TF-IDF + rule-based scoring). Can be configured for LLM integration via `GEMINI_API_KEY` or `OPENAI_API_KEY`.
