
CREATE LOGIN ValentineNode WITH PASSWORD = '12345';
use NodeLabsDB;
CREATE USER ValentineNode FOR LOGIN ValentineNode;

ALTER ROLE [db_owner] ADD MEMBER ValentineNode;

ALTER LOGIN [ValentineNode] ENABLE;

SELECT name, is_disabled
FROM sys.sql_logins
WHERE name = 'ValentineNode';

CREATE TABLE FACULTY (
    FACULTY VARCHAR(50) PRIMARY KEY,
    FACULTY_NAME VARCHAR(100) NOT NULL
);

select * from FACULTY;

CREATE TABLE PULPIT (
    PULPIT VARCHAR(50) PRIMARY KEY,
    PULPIT_NAME VARCHAR(100) NOT NULL,
    FACULTY VARCHAR(50) NOT NULL,
    FOREIGN KEY (FACULTY) REFERENCES FACULTY(FACULTY)
);


CREATE TABLE TEACHER (
    TEACHER VARCHAR(50) PRIMARY KEY,
    TEACHER_NAME VARCHAR(100) NOT NULL,
    PULPIT VARCHAR(50) NOT NULL,
    FOREIGN KEY (PULPIT) REFERENCES PULPIT(PULPIT)
);

CREATE TABLE SUBJECT (
    SUBJECT VARCHAR(50) PRIMARY KEY,
    SUBJECT_NAME VARCHAR(100) NOT NULL,
    PULPIT VARCHAR(50) NOT NULL,
    FOREIGN KEY (PULPIT) REFERENCES PULPIT(PULPIT)
);

CREATE TABLE AUDITORIUM_TYPE (
    AUDITORIUM_TYPE VARCHAR(50) PRIMARY KEY,
    AUDITORIUM_TYPENAME VARCHAR(100) NOT NULL
);

CREATE TABLE AUDITORIUM (
    AUDITORIUM VARCHAR(50) PRIMARY KEY,
    AUDITORIUM_NAME VARCHAR(100) NOT NULL,
    AUDITORIUM_CAPACITY INT NOT NULL,
    AUDITORIUM_TYPE VARCHAR(50) NOT NULL,
    FOREIGN KEY (AUDITORIUM_TYPE) REFERENCES AUDITORIUM_TYPE(AUDITORIUM_TYPE)
);

select faculty, faculty_name from faculty;

-- Заполнение таблицы FACULTY
INSERT INTO FACULTY (FACULTY, FACULTY_NAME) VALUES
('IT', 'Информационные технологии'),
('PHYS', 'Физика'),
('MATH', 'Математика'),
('CHEM', 'Химия'),
('BIO', 'Биология');

-- Заполнение таблицы PULPIT
INSERT INTO PULPIT (PULPIT, PULPIT_NAME, FACULTY) VALUES
('IT_DEV', 'Разработка программного обеспечения', 'IT'),
('IT_NET', 'Сетевые технологии', 'IT'),
('PHYS_2', 'Физика 2', 'PHYS'),
('MATH_ANAL', 'Аналитическая математика', 'MATH'),
('CHEM_ORG', 'Органическая химия', 'CHEM');

-- Заполнение таблицы TEACHER
INSERT INTO TEACHER (TEACHER, TEACHER_NAME, PULPIT) VALUES
('J_Smith', 'Джон Смит', 'IT_DEV'),
('M_Jones', 'Мэри Джонс', 'IT_NET'),
('A_Brown', 'Александр Браун', 'PHYS_2'),
('S_Davis', 'Сара Дэвис', 'MATH_ANAL'),
('R_Clark', 'Роберт Кларк', 'CHEM_ORG');

-- Заполнение таблицы SUBJECT
INSERT INTO SUBJECT (SUBJECT, SUBJECT_NAME, PULPIT) VALUES
('JAVA101', 'Введение в Java', 'IT_DEV'),
('NET301', 'Сетевые технологии 301', 'IT_NET'),
('PHYS101', 'Физика 101', 'PHYS_2'),
('MATH201', 'Математика для инженеров', 'MATH_ANAL'),
('CHEM301', 'Органическая химия 301', 'CHEM_ORG');

-- Заполнение таблицы AUDITORIUM_TYPE
INSERT INTO AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES
('L', 'Лекционный'),
('P', 'Практический'),
('S', 'Семинарский'),
('LBR', 'Лабораторный'),
('C', 'Конференц-зал');

-- Заполнение таблицы AUDITORIUM
INSERT INTO AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES
('A1', 'Аудитория 1', 30, 'L'),
('A2', 'Аудитория 2', 25, 'P'),
('A3', 'Аудитория 3', 40, 'S'),
('A4', 'Аудитория 4', 50, 'LBR'),
('A5', 'Аудитория 5', 20, 'C');



