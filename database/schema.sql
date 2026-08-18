-- SkillBridge Database Schema
-- PostgreSQL

-- Users table (both students and recruiters)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'recruiter')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Student profile details
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL DEFAULT '{}',
    resume_url VARCHAR(500),
    cgpa NUMERIC(3,2),
    interests TEXT[] DEFAULT '{}',
    college VARCHAR(150),
    branch VARCHAR(100),
    graduation_year INTEGER,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Company/recruiter details
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255)
);

-- Job/internship postings
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    stipend VARCHAR(50),
    location VARCHAR(100),
    deadline DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Applications (the join table with match score)
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2),
    status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'selected')),
    applied_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, job_id)
);

-- Indexes for common queries
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_users_email ON users(email);
