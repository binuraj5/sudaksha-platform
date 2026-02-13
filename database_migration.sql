-- Database Migration Script for Courses Page Enhancement
-- Execute this script to add new columns to the courses table and create the finishing_school table

-- Add new columns to courses table (Non-destructive - maintains existing data)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS delivery_mode TEXT DEFAULT 'ONLINE' CHECK (delivery_mode IN ('ONLINE', 'OFFLINE', 'HYBRID'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'IT' CHECK (category_type IN ('IT', 'NON_IT'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Generic/All Industries';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_level TEXT DEFAULT 'JUNIOR' CHECK (target_level IN ('JUNIOR', 'MIDDLE', 'SENIOR', 'MANAGEMENT', 'EXECUTIVE'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'TECHNOLOGY' CHECK (course_type IN ('TECHNOLOGY', 'IT', 'FUNCTIONAL', 'PROCESS', 'BEHAVIORAL', 'PERSONAL'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_self_paced BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_url TEXT;

-- Create finishing_school table
CREATE TABLE IF NOT EXISTS finishing_school (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_type TEXT NOT NULL CHECK (category_type IN ('IT', 'NON_IT')),
    industry TEXT DEFAULT 'Generic/All Industries',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_category_type ON courses(category_type);
CREATE INDEX IF NOT EXISTS idx_courses_industry ON courses(industry);
CREATE INDEX IF NOT EXISTS idx_courses_target_level ON courses(target_level);
CREATE INDEX IF NOT EXISTS idx_courses_course_type ON courses(course_type);
CREATE INDEX IF NOT EXISTS idx_courses_delivery_mode ON courses(delivery_mode);
CREATE INDEX IF NOT EXISTS idx_finishing_school_category_type ON finishing_school(category_type);
CREATE INDEX IF NOT EXISTS idx_finishing_school_industry ON finishing_school(industry);

-- Optional: Insert sample data for finishing_school table (uncomment to use)
/*
INSERT INTO finishing_school (title, description, category_type, industry) VALUES
('Software Engineering Foundation', 'Comprehensive foundation program for aspiring software engineers', 'IT', 'Generic/All Industries'),
('Business Analysis Foundation', 'Essential skills for business analysts and consultants', 'NON_IT', 'Consulting'),
('Data Analytics Foundation', 'Foundation program for data analytics and business intelligence', 'IT', 'Generic/All Industries');
*/
