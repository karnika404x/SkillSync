# SkillSync

SkillSync is a web application for finding employees who are a good fit
for internal projects.

The main idea is simple: instead of looking only at someone's current
job role, the system looks at their skills, experience, interests and
some performance information to find possible project matches. It also
has sections for hidden skills and upskilling.

## What the project does

-   Employee dashboard
-   Internal project marketplace
-   AI-based skill matching
-   Hidden talent discovery
-   Skill gap and upskilling section
-   Application management
-   Admin/project management

For example, if a project needs Python, SQL and Machine Learning,
SkillSync compares those requirements with employee profiles and shows
possible matches.

## Tech used

### Frontend

-   React
-   Vite
-   JavaScript / JSX
-   CSS

### Backend

-   Python
-   FastAPI
-   Uvicorn
-   SQLAlchemy
-   Pydantic
-   JWT authentication
-   Passlib / bcrypt

### Matching

-   scikit-learn
-   NumPy
-   TF-IDF
-   Cosine similarity

### Database

-   SQLite

### Testing

-   Pytest
-   HTTPX

## How it works

The frontend is built with React and handles the pages and user
interaction.

The backend is built with FastAPI. React sends requests to the backend,
and the backend handles users, projects, applications and matching.

``` text
React frontend
      |
      | API request
      v
FastAPI backend
      |
      +---- SQLite database
      |
      +---- Matching engine
                |
                +---- Skill overlap
                +---- TF-IDF similarity
                +---- Experience
                +---- Interests
                +---- Performance
```

## Matching logic

The matching system combines machine learning with simple scoring rules.

The current score is based on:

-   50% skill overlap
-   15% text similarity
-   15% experience
-   10% interest alignment
-   10% performance

For text similarity, employee information and project information are
converted into TF-IDF vectors. Cosine similarity is then used to compare
them.

The other parts of the score come from employee and project data.

## Hidden talent

SkillSync also looks for skills that may not be obvious from an
employee's current role.

For example, someone listed as a frontend developer may also have Python
or NLP skills. If a suitable project needs those skills, the employee
can be shown as a possible match.

## Upskilling

The upskilling section looks at the difference between the skills needed
by a project and the skills an employee already has.

Example:

``` text
Project needs:
Python
SQL
AWS
Docker

Employee has:
Python
SQL

Missing:
AWS
Docker
```

The missing skills can then be used to suggest areas for learning.

## Project structure

``` text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── ai_matcher.py
│   └── routers/
│       ├── matching.py
│       ├── employees.py
│       ├── projects.py
│       └── applications.py
├── tests/
│   ├── test_auth.py
│   ├── test_employees.py
│   ├── test_matching.py
│   └── test_projects.py
├── requirements.txt
└── run_backend.py

frontend/
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── services/
    │   └── api.js
    ├── components/
    │   └── Charts.jsx
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── MarketplacePage.jsx
        ├── MatchingPage.jsx
        ├── HiddenTalentPage.jsx
        ├── UpskillingPage.jsx
        └── AdminPage.jsx
```

## Running the backend

Go to the backend folder:

``` bash
cd backend
```

Install the Python dependencies:

``` bash
pip install -r requirements.txt
```

Start the backend:

``` bash
python run_backend.py
```

## Running the frontend

Go to the frontend folder:

``` bash
cd frontend
```

Install packages:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

Open the address shown by Vite.

## API documentation

FastAPI provides API documentation automatically while the backend is
running.

Open:

``` text
/docs
```

## Authentication

The application uses JWT tokens for authentication.

After login, the backend returns a token and the frontend uses it for
protected API requests.

Different roles have different permissions, including employee, project
manager and admin.

## Testing

Backend tests are written using Pytest.

Run:

``` bash
pytest
```

The tests cover areas such as authentication, employees, projects and
matching.

## Note about the dashboard

Some dashboard numbers in the current prototype are sample/demo values
used for the interface. Other values, such as project distribution and
matching results, are calculated from application data.

The matching page is the main place where the matching logic is used.

## Why we built it

Companies often have people with useful skills that are not visible
outside their current role.

SkillSync is built around a simple idea:

> Find the right people inside the organization before looking outside.

It can help with internal mobility, project staffing and identifying
areas where employees can grow.

## Future improvements

-   Better semantic matching using embeddings
-   More detailed learning recommendations
-   More project and employee analytics
-   Better explanation of individual match scores
-   Integration with real HR systems
-   More advanced skill-gap tracking
