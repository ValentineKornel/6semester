

ALTER TABLE Task ADD completion_date DATE;

INSERT INTO Task (title, description, creation_date, deadline, status, type, project_id, creator_id, executor_id)
SELECT 
    'Task ' || ROWNUM, 
    'Description for task ' || ROWNUM,
    TRUNC(SYSDATE) - FLOOR(DBMS_RANDOM.VALUE(1, 365)),
    TRUNC(SYSDATE) + FLOOR(DBMS_RANDOM.VALUE(1, 30)),
    'In Progress',
    CASE FLOOR(DBMS_RANDOM.VALUE(0, 3))
        WHEN 0 THEN 'Bug' 
        WHEN 1 THEN 'Feature' 
        ELSE 'Improvement' 
    END,
    MOD(ABS(DBMS_RANDOM.RANDOM), 10) + 1,
    MOD(ABS(DBMS_RANDOM.RANDOM), 10) + 1,
    MOD(ABS(DBMS_RANDOM.RANDOM), 10) + 1
FROM dual
CONNECT BY LEVEL <= 100;

SELECT * FROM Task ORDER BY completion_date;

UPDATE Task SET completion_date = creation_date + INTERVAL '7' DAY;


--3
SELECT DISTINCT 
    EXTRACT(YEAR FROM completion_date) AS year,
    CASE 
        WHEN EXTRACT(MONTH FROM completion_date) <= 6 THEN 'Half 1' ELSE 'Half 2' END AS half_year,
    CASE 
        WHEN EXTRACT(MONTH FROM completion_date) <= 3 THEN 'Quarter 1'
        WHEN EXTRACT(MONTH FROM completion_date) <= 6 THEN 'Quarter 2'
        WHEN EXTRACT(MONTH FROM completion_date) <= 9 THEN 'Quarter 3'
        ELSE 'Quarter 4'
    END AS quarter,
    EXTRACT(MONTH FROM completion_date) AS month,
    COUNT(*) OVER (PARTITION BY EXTRACT(MONTH FROM completion_date)) AS month_total,
    COUNT(*) OVER (
        PARTITION BY EXTRACT(YEAR FROM completion_date), 
        CASE 
            WHEN EXTRACT(MONTH FROM completion_date) <= 3 THEN 1
            WHEN EXTRACT(MONTH FROM completion_date) <= 6 THEN 2
            WHEN EXTRACT(MONTH FROM completion_date) <= 9 THEN 3
            ELSE 4
        END
    ) AS quarter_total,
    COUNT(*) OVER (
        PARTITION BY EXTRACT(YEAR FROM completion_date), 
        CASE WHEN EXTRACT(MONTH FROM completion_date) <= 6 THEN 'Half 1' ELSE 'Half 2' END) AS half_year_total,
    COUNT(*) OVER (PARTITION BY EXTRACT(YEAR FROM completion_date)) AS year_total
FROM Task WHERE status = 'Completed' ORDER BY year;


--4
--seems a bit not logical сравнение с общим количеством не выполненных поручений (в %).
SELECT
    total_tasks_completed_in_interval,
    total_tasks_completed,
    total_tasks_cancelled,
    TO_CHAR(total_tasks_completed_in_interval * 100.0 / total_tasks_completed, 'FM90.00') AS percent_interval_to_total_completed,
    TO_CHAR(total_tasks_completed_in_interval * 100.0 / total_tasks_cancelled, 'FM90.00') AS percent_interval_to_total_cancelled
FROM (
    SELECT 
        COUNT(CASE WHEN status = 'Completed' AND completion_date >= ADD_MONTHS(SYSDATE, -3) THEN 1 END) AS total_tasks_completed_in_interval,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS total_tasks_completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS total_tasks_cancelled
    FROM Task
) subQ;


-- it seems more logical
SELECT
    total_tasks_completed_in_interval,
    total_tasks_cancalled_in_interval,
    total_tasks_completed,
    total_tasks_cancelled,
    TO_CHAR(total_tasks_completed_in_interval * 100.0 / total_tasks_completed, 'FM90.00') AS percent_interval_to_total_completed,
    TO_CHAR(total_tasks_cancalled_in_interval * 100.0 / total_tasks_cancelled, 'FM90.00') AS percent_interval_to_total_cancelled
FROM (
    SELECT 
        COUNT(CASE WHEN status = 'Completed' AND completion_date >= ADD_MONTHS(SYSDATE, -3) THEN 1 END) AS total_tasks_completed_in_interval,
        COUNT(CASE WHEN status = 'Cancelled' AND completion_date >= ADD_MONTHS(SYSDATE, -3) THEN 1 END) AS total_tasks_cancalled_in_interval,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS total_tasks_completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS total_tasks_cancelled
    FROM Task
) subQ;


--5
WITH MonthlyTasks AS (
    SELECT
        executor_id AS employee_id,
        EXTRACT(YEAR FROM completion_date) AS year,
        EXTRACT(MONTH FROM completion_date) AS month,
        CASE 
            WHEN status = 'Completed' THEN 1
            ELSE 0
        END AS completed_task,
        CASE 
            WHEN status <> 'Completed' THEN 1
            ELSE 0
        END AS not_completed_task
    FROM Task
    WHERE completion_date >= ADD_MONTHS(SYSDATE, -6)
)
SELECT DISTINCT
    employee_id,
    year,
	month,
    SUM(completed_task) OVER (PARTITION BY employee_id, year, month) AS completed_tasks,
    SUM(not_completed_task) OVER (PARTITION BY employee_id, year, month) AS not_completed_tasks
FROM MonthlyTasks
ORDER BY employee_id, year, month;


--6
WITH
TaskCounts AS (
    SELECT
        type,
        executor_id,
        COUNT(*) OVER (PARTITION BY type, executor_id) AS amount
    FROM Task
)
SELECT
    type,
    executor_id,
    amount
FROM (
    SELECT
        type,
        executor_id,
        amount,
        ROW_NUMBER() OVER (PARTITION BY type ORDER BY amount DESC) AS row_num
    FROM TaskCounts
) subQ
WHERE row_num = 1;





CREATE TABLE Groupings(
	A NVARCHAR2(5),
	B NVARCHAR2(5),
	C NVARCHAR2(5),
	VALUE NUMBER
);

select * from Groupings;

INSERT INTO Groupings VALUES ('A1', 'B1', 'C1', 10);
INSERT INTO Groupings VALUES ('A1', 'B1', 'C1', 20);
INSERT INTO Groupings VALUES ('A1', 'B1', 'C2', 30);
INSERT INTO Groupings VALUES ('A1', 'B2', 'C1', 40);
INSERT INTO Groupings VALUES ('A1', 'B2', 'C1', 50);
INSERT INTO Groupings VALUES ('A2', 'B2', 'C2', 60);


--GROUP_ID
SELECT A, B, C, SUM(VALUE), GROUP_ID() AS group_id
FROM Groupings
GROUP BY ROLLUP(a, b), GROUPING SETS ((a, b), (a), (c), ());


SELECT A, B, C, SUM(VALUE), GROUP_ID() AS group_id
FROM Groupings
GROUP BY ROLLUP(a, b), GROUPING SETS ((a, b), (a), (c), ())
HAVING GROUP_ID() < 1;


--GROUPING_ID
SELECT A, B, C, SUM(VALUE), GROUP_ID() AS group_id, GROUPING(B) AS GR_B
FROM Groupings
GROUP BY ROLLUP(A, B, C);

SELECT A, B, C, SUM(VALUE), GROUP_ID() AS group_id, GROUPING_ID(A, B, C) AS GR_ALL
FROM Groupings
GROUP BY ROLLUP(A, B, C);


--MEDIAN
SELECT A, B, C, VALUE,
       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY VALUE) OVER (PARTITION BY A)  AS third_quartile, 
       MEDIAN(VALUE) OVER (PARTITION BY A) AS median_value
FROM Groupings;



--ROWS
SELECT A, B, C, VALUE,
       SUM(VALUE) OVER (ORDER BY VALUE ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS sum
FROM Groupings;


--RANGE
SELECT A, B, C, VALUE,
       SUM(VALUE) OVER (ORDER BY VALUE RANGE BETWEEN 10 PRECEDING AND 10 FOLLOWING) AS sum
FROM Groupings;


--NTILE
SELECT A, B, C, VALUE,
	   NTILE(2) OVER (PARTITION BY A ORDER BY VALUE)  AS part
FROM Groupings;














