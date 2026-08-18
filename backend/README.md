## Setup

### 1. Install PostgreSQL
Download and install from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/).
During installation, set a password for the `postgres` user — remember it, you'll need it for `.env`.

### 2. Create the database
Open **pgAdmin** (installed alongside PostgreSQL) or use the command line:
```bash
psql -U postgres
CREATE DATABASE skillbridge;
\q
```

### 3. Load the schema
```bash
psql -U postgres -d skillbridge -f database/schema.sql
```
(Run this from the project root, not inside `backend/`, since `schema.sql` lives in `database/`.)

### 4. Install dependencies
```bash
cd backend
npm install
```

### 5. Configure environment
```bash
copy .env.example .env
```
Then open `.env` and fill in your DB password, JWT secret, and Gemini API key.

### 6. Run
```bash
npm run dev
```
Server runs on `http://localhost:5000`. Health check: `GET /health`