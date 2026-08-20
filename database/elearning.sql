-- ============================================
-- RCVD E-LEARNING DATABASE
-- PostgreSQL
-- ============================================

DROP TABLE IF EXISTS subchapters CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;


-- ============================================
-- INSTRUCTORS
-- ============================================

CREATE TABLE instructors (
    id INTEGER PRIMARY KEY
        CHECK (id BETWEEN 1000000 AND 9999999),

    firstname VARCHAR(100) NOT NULL,

    lastname VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    phone VARCHAR(30),

    bio TEXT,

    password VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- COURSES
-- ============================================

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    duration INTEGER,

    price NUMERIC(12, 2) DEFAULT 0,

    instructor_id INTEGER,

    CONSTRAINT fk_instructor
        FOREIGN KEY (instructor_id)
        REFERENCES instructors(id)
        ON DELETE SET NULL
);


-- ============================================
-- CHAPTERS
-- ============================================

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    course_id INTEGER NOT NULL,

    CONSTRAINT fk_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE
);


-- ============================================
-- SUBCHAPTERS
-- ============================================

CREATE TABLE subchapters (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    content TEXT,

    chapter_id INTEGER NOT NULL,

    CONSTRAINT fk_chapter
        FOREIGN KEY (chapter_id)
        REFERENCES chapters(id)
        ON DELETE CASCADE
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_courses_instructor
    ON courses(instructor_id);

CREATE INDEX idx_chapters_course
    ON chapters(course_id);

CREATE INDEX idx_subchapters_chapter
    ON subchapters(chapter_id);


-- ============================================
-- END OF SCHEMA
-- ============================================