INSERT INTO [Task] (title, description, creation_date, deadline, completion_date, status, type, project_id, creator_id, executor_id)
SELECT 
    CONCAT('Task ', ROW_NUMBER() OVER (ORDER BY NEWID())), 
    'Description for task ' + CAST(ROW_NUMBER() OVER (ORDER BY NEWID()) AS NVARCHAR),
    DATEADD(DAY, -CAST(RAND(CHECKSUM(NEWID())) * 365 AS INT), GETDATE()), 
    DATEADD(DAY, CAST(RAND(CHECKSUM(NEWID())) * 30 AS INT), GETDATE()),
    DATEADD(DAY, CAST(RAND(CHECKSUM(NEWID())) * 40 AS INT), GETDATE()),
    'Completed',
    CASE FLOOR(RAND() * 3) 
        WHEN 0 THEN 'Bug' 
        WHEN 1 THEN 'Feature' 
        ELSE 'Improvement' 
    END,
    ABS(CHECKSUM(NEWID())) % 10 + 1,
    ABS(CHECKSUM(NEWID())) % 10 + 1,
    CASE WHEN RAND() > 0.2 THEN ABS(CHECKSUM(NEWID())) % 10 + 1 ELSE NULL END
FROM GENERATE_SERIES(1, 100);

SELECT * from task order by completion_date;
ALTER TABLE Task ADD completion_date DATE;
UPDATE Task 
SET completion_date = DATEADD(DAY, 7, creation_date);


--3
SELECT DISTINCT YEAR(completion_date) AS year,
		CASE WHEN MONTH(completion_date) <= 6 THEN 'Half 1' ELSE 'Half 2' END AS half_year,
		CASE
			WHEN MONTH(completion_date) <= 3 THEN 'Quarter 1'
			WHEN MONTH(completion_date) <= 6 THEN 'Quarter 2'
			WHEN MONTH(completion_date) <= 9 THEN 'Quarter 3'
			ELSE 'Quarter 4'
		END AS quarter,
		MONTH(completion_date) AS month,
		COUNT(*) OVER (PARTITION BY MONTH(completion_date)) as month_total,
		COUNT(*) OVER (PARTITION BY YEAR(completion_date), 
		CASE
			WHEN MONTH(completion_date) <= 3 THEN 1
			WHEN MONTH(completion_date) <= 6 THEN 2
			WHEN MONTH(completion_date) <= 9 THEN 3
			ELSE 4
		END) AS quarter_total,
		COUNT(*) OVER (PARTITION BY YEAR(completion_date), 
			CASE WHEN MONTH(completion_date) <= 6 THEN 'Half 1' ELSE 'Half 2' END) AS half_year_total,
		COUNT(*) OVER (PARTITION BY YEAR(completion_date)) as year_total
FROM Task where status = 'Completed';
		


--4
--seems a bit not logical сравнение с общим количеством не выполненных поручений (в %).
DECLARE @intervalMonth INT = 3
SELECT
	total_tasks_completed_in_interval,
	total_tasks_completed,
	total_tasks_cancelled,
	FORMAT(total_tasks_completed_in_interval * 100.0 / total_tasks_completed, '0.##') AS percent_interval_to_total_completed,
	FORMAT(total_tasks_completed_in_interval * 100.0 / total_tasks_cancelled, '0.##') AS percent_interval_to_total_cancelled
FROM
(SELECT 
	COUNT(CASE WHEN status = 'Completed' AND completion_date >= DATEADD(MONTH, -@intervalMonth, GETDATE()) THEN 1 END) AS total_tasks_completed_in_interval,
	COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS total_tasks_completed,
	COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS total_tasks_cancelled
FROM Task) as subQ


-- it seems more logical
DECLARE @intervalMonth INT = 3
SELECT
	total_tasks_completed_in_interval,
	total_tasks_cancelled_in_interval,
	total_tasks_completed,
	total_tasks_cancelled,
	FORMAT(total_tasks_completed_in_interval * 100.0 / total_tasks_completed, '0.##') AS percent_interval_to_total_completed,
	FORMAT(total_tasks_cancelled_in_interval * 100.0 / total_tasks_cancelled, '0.##') AS percent_interval_to_total_cancelled
FROM
(SELECT 
	COUNT(CASE WHEN status = 'Completed' AND completion_date >= DATEADD(MONTH, -@intervalMonth, GETDATE()) THEN 1 END) AS total_tasks_completed_in_interval,
	COUNT(CASE WHEN status = 'Cancelled' AND completion_date >= DATEADD(MONTH, -@intervalMonth, GETDATE()) THEN 1 END) AS total_tasks_cancelled_in_interval,
	COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS total_tasks_completed,
	COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS total_tasks_cancelled
FROM Task) as subQ



--5
DECLARE @page INT = 2;
WITH Tasks AS (SELECT id, 
					title, 
					description,  
					deadline, 
					status, 
					executor_id,
					ROW_NUMBER() OVER (ORDER BY id) as rowNum
				FROM Task)
SELECT id, title, description, deadline, status, executor_id
FROM Tasks 
WHERE rowNum BETWEEN case when @page = 1 then (@page - 1) * 20 else ((@page - 1) * 20) + 1 END AND @page * 20;


--6
select * from [User];
INSERT INTO [User](name, surname, email, role, salary) VALUES ('Иван', 'Иванов', 'ivanov2@example.com', 'Admin', '7000');


SELECT id, name,
	   ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rowNum 
FROM [User];

WITH Users AS(SELECT id, name,
	   				 ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rowNum 
			  FROM [User])
DELETE
FROM Users
WHERE rowNum > 1;



--7
DECLARE @intervalMonths INT = 6;
WITH MonthlyTasks AS (
    SELECT 
        executor_id AS employee_id,
        YEAR(completion_date) AS year,
        MONTH(completion_date) AS month,
        CASE 
            WHEN status = 'Completed' THEN 1
            ELSE 0
        END AS completed_task,
        CASE 
            WHEN status <> 'Completed' THEN 1
            ELSE 0
        END AS not_completed_task
    FROM Task
    WHERE completion_date >= DATEADD(MONTH, -@intervalMonths, GETDATE())
)
SELECT DISTINCT
    employee_id,
    year,
	month,
    SUM(completed_task) OVER (PARTITION BY employee_id, year, month) AS completed_tasks,
    SUM(not_completed_task) OVER (PARTITION BY employee_id, year, month) AS not_completed_tasks
FROM MonthlyTasks
ORDER BY employee_id, year, month;


--8
WITH MonthlyTasks AS (
    SELECT
    	type,
        executor_id,
        COUNT(*) OVER (PARTITION BY type, executor_id) as amount
    FROM Task)
SELECT
	type,
	executor_id,
	amount
FROM(
	SELECT
	type,
    executor_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY type ORDER BY amount DESC) as rowNum
	FROM MonthlyTasks
) subQ
WHERE rowNum = 1;








CREATE TABLE Groupings(
	A VARCHAR(5),
	B VARCHAR(5),
	C VARCHAR(5),
	VALUE INT
);

select * from Groupings;

INSERT INTO Groupings VALUES ('A1', 'B1', 'C1', 10);
INSERT INTO Groupings VALUES ('A1', 'B1', 'C1', 20);
INSERT INTO Groupings VALUES ('A1', 'B1', 'C2', 30);
INSERT INTO Groupings VALUES ('A1', 'B2', 'C1', 40);
INSERT INTO Groupings VALUES ('A1', 'B2', 'C1', 50);
INSERT INTO Groupings VALUES ('A2', 'B2', 'C2', 60);


SELECT A, B, C, SUM(VALUE)
FROM Groupings
GROUP BY A, B, C;

SELECT A, B, C, SUM(VALUE)
FROM Groupings
GROUP BY ROLLUP (A, B, C);

SELECT A, B, C, SUM(VALUE)
FROM Groupings
GROUP BY CUBE (A, B, C);

SELECT A, B, C, SUM(VALUE)
FROM Groupings
GROUP BY GROUPING SETS ((A, b), B, C);

--GROUPING
delete from Groupings where VALUE > 60;
select * from Groupings;

INSERT INTO Groupings VALUES ('A2', 'B2', NULL, 70);

SELECT A, C, SUM(VALUE), GROUPING(A) as agrA, GROUPING(C) as agrC
FROM Groupings
GROUP BY GROUPING SETS ((A, C), A, ());




--rank, dense_rank
delete from Groupings where VALUE > 60;
select * from Groupings;

INSERT INTO Groupings VALUES ('A2', 'B2', NULL, 70);
INSERT INTO Groupings VALUES ('A2', 'B2', NULL, 70);
INSERT INTO Groupings VALUES ('A2', 'B2', NULL, 70);
INSERT INTO Groupings VALUES ('A2', 'B2', NULL, 80);
INSERT INTO Groupings VALUES ('A2', 'B2', NULL, 90);

SELECT A, B, C, VALUE,
       ROW_NUMBER() OVER (ORDER BY VALUE) AS row_num,
       RANK() OVER (ORDER BY VALUE) AS rank_num,
       DENSE_RANK() OVER (ORDER BY VALUE) AS dense_rank_num
FROM Groupings;



--LEAN, LAG
SELECT A, B, C, VALUE,
       LEAD(VALUE, 2, NULL) OVER (ORDER BY VALUE) AS next_val,
       LAG(VALUE, 2, NULL) OVER (ORDER BY VALUE) AS prev_val
FROM Groupings;


--PERCENTILE_CONT
SELECT A, B, C, VALUE,
	   PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY VALUE) OVER (PARTITION BY A)  AS first_quartile,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY VALUE) OVER (PARTITION BY A)  AS third_quartile
FROM Groupings;


SELECT A, B, C, VALUE,
	   NTILE(3) OVER (PARTITION BY A)  AS first_quartile
FROM Groupings;



