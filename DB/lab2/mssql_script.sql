CREATE DATABASE ExecutionControl
ON
( NAME = MyDatabase_Data,
  FILENAME = 'D:\Study\university\DB\db_files\ExecutionControl.mdf',
  SIZE = 10MB,
  MAXSIZE = 200MB,
  FILEGROWTH = 10MB )
LOG ON
( NAME = MyDatabase_Log,
  FILENAME = 'D:\Study\university\DB\db_files\ExecutionControl.ldf',
  SIZE = 5MB,
  MAXSIZE = 50MB,
  FILEGROWTH = 5MB );


CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    surname NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    role NVARCHAR(50) NOT NULL,	
    salary DECIMAL(18,2) CHECK (salary >= 0),
    CONSTRAINT chk_user_role CHECK (role IN ('Admin', 'Manager', 'Employee'))
);

CREATE TABLE [Project] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    manager_id INT NOT NULL,
    CONSTRAINT fk_project_manager FOREIGN KEY (manager_id) 
        REFERENCES [User](id),
    CONSTRAINT chk_project_dates CHECK (start_date <= deadline)
);

CREATE TABLE [Task] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    creation_date DATE NOT NULL,
    deadline DATE NOT NULL,
    status NVARCHAR(50) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    project_id INT NOT NULL,
    creator_id INT NOT NULL,
    executor_id INT,
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) 
        REFERENCES [Project](id) ON DELETE CASCADE,
    CONSTRAINT fk_task_creator FOREIGN KEY (creator_id) 
        REFERENCES [User](id),
    CONSTRAINT fk_task_executor FOREIGN KEY (executor_id)
    	REFERENCES [User](id) ON DELETE SET NULL,
    CONSTRAINT chk_task_status CHECK (status IN ('New', 'In Progress', 'Completed', 'Cancelled')),
    CONSTRAINT chk_task_dates CHECK (creation_date <= deadline)
);


CREATE TABLE [Report] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT NOT NULL,
    date DATE NOT NULL DEFAULT GETDATE(),
    description NVARCHAR(255) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    file_url NVARCHAR(255),
    CONSTRAINT fk_report_task FOREIGN KEY (task_id) 
        REFERENCES [Task](id) ON DELETE CASCADE,
    CONSTRAINT chk_report_status CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved'))
);

CREATE TABLE [Comment] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    date DATE NOT NULL DEFAULT GETDATE(),
    text NVARCHAR(255) NOT NULL,
    CONSTRAINT fk_comment_task FOREIGN KEY (task_id) 
        REFERENCES [Task](id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) 
        REFERENCES [User](id) ON DELETE CASCADE
);


CREATE INDEX idx_report_date ON Report (date);
select * from Report WHERE date < getdate();

CREATE PROCEDURE insert_user
    @name NVARCHAR(100),
    @surname NVARCHAR(100),
    @email NVARCHAR(100),
    @role NVARCHAR(50),
    @salary DECIMAL(18,2)
AS
BEGIN
    INSERT INTO [User] (name, surname, email, role, salary)
    VALUES (@name, @surname, @email, @role, @salary);
END;


CREATE PROCEDURE insert_project
    @title NVARCHAR(100),
    @description NVARCHAR(255),
    @start_date DATE,
    @deadline DATE,
    @manager_id INT
AS
BEGIN
    INSERT INTO [Project] (title, description, start_date, deadline, manager_id)
    VALUES (@title, @description, @start_date, @deadline, @manager_id);
END;


CREATE PROCEDURE insert_task
    @title NVARCHAR(100),
    @description NVARCHAR(255),
    @creation_date DATE,
    @deadline DATE,
    @status NVARCHAR(50),
    @type NVARCHAR(50),
    @project_id INT,
    @creator_id INT,
    @executor_id INT NULL
AS
BEGIN
    INSERT INTO [Task] (title, description, creation_date, deadline, status, type, project_id, creator_id, executor_id)
    VALUES (@title, @description, @creation_date, @deadline, @status, @type, @project_id, @creator_id, @executor_id);
END;


CREATE PROCEDURE insert_report
    @task_id INT,
    @date DATE,
    @description NVARCHAR(255),
    @status NVARCHAR(50),
    @file_url NVARCHAR(255) NULL
AS
BEGIN
    INSERT INTO [Report] (task_id, date, description, status, file_url)
    VALUES (@task_id, @date, @description, @status, @file_url);
END;


CREATE PROCEDURE insert_comment
    @task_id INT,
    @user_id INT,
    @date DATE,
    @text NVARCHAR(255)
AS
BEGIN
    INSERT INTO [Comment] (task_id, user_id, date, text)
    VALUES (@task_id, @user_id, @date, @text);
END;


BEGIN TRANSACTION;
EXEC insert_user 'Иван', 'Иванов', 'ivanov@example.com', 'Admin', 7000;
EXEC insert_user 'Петр', 'Петров', 'petrov@example.com', 'Manager', 6000;
EXEC insert_user 'Алексей', 'Сидоров', 'sidorov@example.com', 'Employee', 5000;
EXEC insert_user 'Мария', 'Кузнецова', 'kuznetsova@example.com', 'Employee', 5200;
EXEC insert_user 'Ольга', 'Смирнова', 'smirnova@example.com', 'Employee', 4800;
EXEC insert_user 'Дмитрий', 'Васильев', 'vasiliev@example.com', 'Manager', 6100;
EXEC insert_user 'Сергей', 'Михайлов', 'mikhailov@example.com', 'Employee', 5300;
EXEC insert_user 'Анна', 'Федорова', 'fedorova@example.com', 'Employee', 4900;
EXEC insert_user 'Виктор', 'Тихонов', 'tikhonov@example.com', 'Manager', 6200;
EXEC insert_user 'Елена', 'Орлова', 'orlova@example.com', 'Employee', 4700;
COMMIT;

BEGIN TRANSACTION;
EXEC insert_project 'CRM-система', 'Разработка CRM для компании', '2025-03-01', '2025-09-01', 2;
EXEC insert_project 'Мобильное приложение', 'Разработка мобильного приложения', '2025-04-01', '2025-10-01', 6;
EXEC insert_project 'Корпоративный портал', 'Создание внутреннего портала', '2025-02-15', '2025-08-15', 9;
EXEC insert_project 'Система аналитики', 'Разработка BI-инструмента', '2025-05-01', '2025-11-01', 2;
EXEC insert_project 'Интернет-магазин', 'Создание e-commerce платформы', '2025-03-15', '2025-07-15', 6;
EXEC insert_project 'ERP-система', 'Разработка ERP-решения', '2025-06-01', '2025-12-01', 9;
EXEC insert_project 'HRM-система', 'Разработка системы для HR', '2025-07-01', '2026-01-01', 2;
EXEC insert_project 'Система учета', 'Автоматизация учета', '2025-08-01', '2026-02-01', 6;
EXEC insert_project 'Платформа IoT', 'Разработка IoT платформы', '2025-09-01', '2026-03-01', 9;
EXEC insert_project 'Система мониторинга', 'Мониторинг серверов', '2025-10-01', '2026-04-01', 2;
COMMIT;

BEGIN TRANSACTION;
EXEC insert_task 'Разработка API', 'Создать REST API', '2025-02-10', '2025-04-01', 'New', 'Development', 1, 1, 3;
EXEC insert_task 'Проектирование БД', 'Создать схему БД', '2025-02-10', '2025-04-05', 'In Progress', 'Database', 1, 1, 4;
EXEC insert_task 'Создание UI', 'Разработать интерфейс', '2025-02-10', '2025-04-10', 'New', 'Frontend', 2, 2, 5;
EXEC insert_task 'Разработка логики', 'Написать бизнес-логику', '2025-02-10', '2025-04-15', 'New', 'Backend', 3, 2, 6;
EXEC insert_task 'Тестирование', 'Разработать тесты', '2025-02-10', '2025-04-20', 'New', 'Testing', 4, 3, 7;
EXEC insert_task 'Документирование', 'Создать документацию', '2025-02-10', '2025-04-25', 'New', 'Documentation', 5, 3, 8;
EXEC insert_task 'Развертывание', 'Настроить сервер', '2025-02-10', '2025-04-30', 'New', 'DevOps', 6, 4, 9;
EXEC insert_task 'Обратная связь', 'Собрать отзывы', '2025-02-10', '2025-05-01', 'New', 'Support', 7, 4, 10;
EXEC insert_task 'Оптимизация', 'Оптимизировать код', '2025-02-10', '2025-05-05', 'New', 'Performance', 8, 5, 3;
EXEC insert_task 'Интеграция', 'Связать с внешними сервисами', '2025-02-10', '2025-05-10', 'New', 'Integration', 9, 5, 4;
COMMIT;


BEGIN TRANSACTION;
EXEC insert_report 1,'2025-02-10', 'Прогресс на 50%', 'Submitted', 'https://example.com/report1.pdf';
EXEC insert_report 2,'2025-02-10', 'Схема БД готова', 'Reviewed', 'https://example.com/report2.pdf';
EXEC insert_report 3,'2025-02-10', 'Создан первый UI макет', 'Draft', 'https://example.com/report3.pdf';
EXEC insert_report 4,'2025-02-10', 'Бизнес-логика написана', 'Submitted', 'https://example.com/report4.pdf';
EXEC insert_report 5,'2025-02-10', 'Тесты проходят успешно', 'Reviewed', 'https://example.com/report5.pdf';
EXEC insert_report 6,'2025-02-10', 'Документация готова', 'Approved', 'https://example.com/report6.pdf';
EXEC insert_report 7,'2025-02-10', 'Сервер развернут', 'Submitted', 'https://example.com/report7.pdf';
EXEC insert_report 8,'2025-02-10', 'Собраны отзывы пользователей', 'Reviewed', 'https://example.com/report8.pdf';
EXEC insert_report 9,'2025-02-10', 'Производительность улучшена', 'Approved', 'https://example.com/report9.pdf';
EXEC insert_report 10,'2025-02-10', 'Интеграция завершена', 'Submitted', 'https://example.com/report10.pdf';
COMMIT;

BEGIN TRANSACTION;
EXEC insert_comment 1, 3,'2025-02-10', 'Отличная работа!';
EXEC insert_comment 2, 4,'2025-02-10', 'Добавьте индексы в БД';
EXEC insert_comment 3, 5,'2025-02-10', 'UI выглядит красиво';
EXEC insert_comment 4, 6,'2025-02-10', 'Хороший код';
EXEC insert_comment 5, 7,'2025-02-10', 'Тесты проходят без ошибок';
EXEC insert_comment 6, 8,'2025-02-10', 'Документация понятна';
EXEC insert_comment 7, 9,'2025-02-10', 'Сервер работает стабильно';
EXEC insert_comment 8, 10,'2025-02-10', 'Отзывы полезны';
EXEC insert_comment 9, 3,'2025-02-10', 'Код стал быстрее';
EXEC insert_comment 10, 4,'2025-02-10', 'Интеграция успешна';
COMMIT;


CREATE OR ALTER PROCEDURE get_users
AS
BEGIN
    DECLARE @output NVARCHAR(MAX);
    
    DECLARE cur CURSOR FOR 
    SELECT id, name, surname, email, role, salary FROM [USER];

    DECLARE @id INT, @name NVARCHAR(100), @surname NVARCHAR(100), @email NVARCHAR(255), @role NVARCHAR(50), @salary DECIMAL(10,2);
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @id, @name, @surname, @email, @role, @salary;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @output = CAST(@id AS NVARCHAR) + ' | ' + @name + ' | ' + @surname + ' | ' + @email + ' | ' + @role + ' | ' + CAST(@salary AS NVARCHAR);
        PRINT @output;
        
        FETCH NEXT FROM cur INTO @id, @name, @surname, @email, @role, @salary;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;
END;

CREATE OR ALTER PROCEDURE get_projects
AS
BEGIN
    DECLARE @output NVARCHAR(MAX);
    
    DECLARE cur CURSOR FOR 
    SELECT id, title, description, start_date, deadline, manager_id FROM Project;

    DECLARE @id INT, @title NVARCHAR(255), @description NVARCHAR(500), @start_date DATE, @deadline DATE, @manager_id INT;
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @id, @title, @description, @start_date, @deadline, @manager_id;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @output = CAST(@id AS NVARCHAR) + ' | ' + @title + ' | ' + @description + ' | ' + CAST(@start_date AS NVARCHAR) + ' | ' + CAST(@deadline AS NVARCHAR) + ' | ' + CAST(@manager_id AS NVARCHAR);
        PRINT @output;
        
        FETCH NEXT FROM cur INTO @id, @title, @description, @start_date, @deadline, @manager_id;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;
END;

CREATE OR ALTER PROCEDURE get_tasks
AS
BEGIN
    DECLARE @output NVARCHAR(MAX);
    
    DECLARE cur CURSOR FOR 
    SELECT id, title, description, creation_date, deadline, status, type, project_id, creator_id, executor_id FROM Task;

    DECLARE @id INT, @title NVARCHAR(255), @description NVARCHAR(500), @creation_date DATE, @deadline DATE, @status NVARCHAR(50), @type NVARCHAR(50), @project_id INT, @creator_id INT, @executor_id INT;
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @id, @title, @description, @creation_date, @deadline, @status, @type, @project_id, @creator_id, @executor_id;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @output = CAST(@id AS NVARCHAR) + ' | ' + @title + ' | ' + @description + ' | ' + CAST(@creation_date AS NVARCHAR) + ' | ' + CAST(@deadline AS NVARCHAR) + ' | ' + @status + ' | ' + @type + ' | ' + CAST(@project_id AS NVARCHAR) + ' | ' + CAST(@creator_id AS NVARCHAR) + ' | ' + CAST(@executor_id AS NVARCHAR);
        PRINT @output;
        
        FETCH NEXT FROM cur INTO @id, @title, @description, @creation_date, @deadline, @status, @type, @project_id, @creator_id, @executor_id;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;
END;

CREATE OR ALTER PROCEDURE get_reports
AS
BEGIN
    DECLARE @output NVARCHAR(MAX);
    
    DECLARE cur CURSOR FOR 
    SELECT id, task_id, [date], description, status, file_url FROM Report;

    DECLARE @id INT, @task_id INT, @date DATE, @description NVARCHAR(500), @status NVARCHAR(50), @file_url NVARCHAR(500);
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @id, @task_id, @date, @description, @status, @file_url;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @output = CAST(@id AS NVARCHAR) + ' | ' + CAST(@task_id AS NVARCHAR) + ' | ' + CAST(@date AS NVARCHAR) + ' | ' + @description + ' | ' + @status + ' | ' + @file_url;
        PRINT @output;
        
        FETCH NEXT FROM cur INTO @id, @task_id, @date, @description, @status, @file_url;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;
END;

CREATE OR ALTER PROCEDURE get_comments
AS
BEGIN
    DECLARE @output NVARCHAR(MAX);
    
    DECLARE cur CURSOR FOR 
    SELECT id, task_id, user_id, [date], text FROM [COMMENT];

    DECLARE @id INT, @task_id INT, @user_id INT, @date DATE, @text NVARCHAR(1000);
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @id, @task_id, @user_id, @date, @text;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @output = CAST(@id AS NVARCHAR) + ' | ' + CAST(@task_id AS NVARCHAR) + ' | ' + CAST(@user_id AS NVARCHAR) + ' | ' + CAST(@date AS NVARCHAR) + ' | ' + @text;
        PRINT @output;
        
        FETCH NEXT FROM cur INTO @id, @task_id, @user_id, @date, @text;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;
END;

EXEC get_users;
EXEC get_projects;
EXEC get_tasks;
EXEC get_reports;
EXEC get_comments;


CREATE OR ALTER VIEW EmployeeTasks AS
SELECT 
    u.id AS employee_id,
    u.name AS employee_name,
    u.surname AS employee_surname,
    u.email AS employee_email,
    u.role AS employee_role,
    u.salary AS employee_salary,
    t.id AS task_id,
    t.title AS task_title,
    t.status AS task_status,
    t.description AS task_description,
    t.creation_date,
    t.deadline,
    t.status,
    t.type,
    t.project_id
FROM [USER] u
JOIN Task t ON u.id = t.executor_id
WHERE t.status in ('New', 'In Progress');

SELECT * FROM EmployeeTasks;


CREATE FUNCTION get_project_completion_rate(@project_id INT)
RETURNS FLOAT
AS
BEGIN
    DECLARE @total_tasks INT, @completed_tasks INT;
    
    SELECT @total_tasks = COUNT(*) FROM Task WHERE project_id = @project_id;
    SELECT @completed_tasks = COUNT(*) FROM Task WHERE project_id = @project_id AND status = 'Completed';

    IF @total_tasks = 0 
        RETURN 0;

    RETURN (CAST(@completed_tasks AS FLOAT) / @total_tasks) * 100;
END;

SELECT dbo.get_project_completion_rate(1);













