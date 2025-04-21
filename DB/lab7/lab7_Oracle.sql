

SELECT id, month, ROUND(salary) AS salary, tasks_completed, total_tasks_completed, performance_ratio FROM (
    WITH task_stats AS (
        SELECT executor_id, EXTRACT(YEAR FROM completion_date) AS year, EXTRACT(MONTH FROM completion_date) AS month, COUNT(*) AS tasks_completed
        FROM Task WHERE status = 'Completed'
        GROUP BY executor_id, EXTRACT(YEAR FROM completion_date), EXTRACT(MONTH FROM completion_date)
    ),
    total_task_stats AS (
        SELECT EXTRACT(YEAR FROM completion_date) AS year, EXTRACT(MONTH FROM completion_date) AS month, COUNT(*) AS total_tasks_completed
        FROM Task WHERE status = 'Completed'
        GROUP BY EXTRACT(YEAR FROM completion_date), EXTRACT(MONTH FROM completion_date)
    )
    SELECT u.id, u.salary, t.YEAR AS year, t.month AS month, 
           t.tasks_completed AS tasks_completed, tt.total_tasks_completed AS total_tasks_completed
    FROM "USER" u
    LEFT JOIN task_stats t 
        ON u.id = t.executor_id
    LEFT JOIN total_task_stats tt 
        ON t.year = tt.year AND t.month = tt.month
)
MODEL 
    PARTITION BY (id)
    DIMENSION BY (month) 
    MEASURES (salary, tasks_completed, total_tasks_completed, 0 AS performance_ratio)
    RULES
    (
		performance_ratio[month] = tasks_completed[CV()] / NULLIF(total_tasks_completed[CV()], 0),
        salary[month] = salary[CV()] * 
            CASE 
                WHEN performance_ratio[CV()] > 0 THEN LEAST(1.15, 1 + performance_ratio[CV()])
                ELSE 0.95
            END
    )
ORDER BY id, month;


SELECT *
FROM (
	SELECT executor_id, 
               EXTRACT(YEAR FROM completion_date) AS year,
               EXTRACT(MONTH FROM completion_date) AS month,
               COUNT(*) AS tasks_completed
        FROM Task
        WHERE status = 'Completed'
        GROUP BY executor_id, EXTRACT(YEAR FROM completion_date), EXTRACT(MONTH FROM completion_date)
)
MATCH_RECOGNIZE (
    PARTITION BY executor_id
    ORDER BY year, month
    MEASURES 
        FIRST(month) AS start_date,
        LAST(month) AS end_date,
        FIRST(tasks_completed) AS first_value,
        LAST(tasks_completed) AS last_value
    ONE ROW PER MATCH
    PATTERN (DROP1 RISE DROP2) 
    DEFINE 
        DROP1 AS tasks_completed < PREV(tasks_completed),
        RISE AS tasks_completed > PREV(tasks_completed),
        DROP2 AS tasks_completed < PREV(tasks_completed)
);




SELECT id, year, month, salary, tasks_completed FROM (
    WITH task_stats AS (
        SELECT executor_id, 
               EXTRACT(YEAR FROM completion_date) AS year,
               EXTRACT(MONTH FROM completion_date) AS month,
               COUNT(*) AS tasks_completed
        FROM Task
        WHERE status = 'Completed'
        GROUP BY executor_id, EXTRACT(YEAR FROM completion_date), EXTRACT(MONTH FROM completion_date)
    )
    SELECT u.id, u.salary, 
           t.YEAR AS year, 
           t.month AS month, 
           t.tasks_completed AS tasks_completed
    FROM "USER" u
    LEFT JOIN task_stats t 
        ON u.id = t.executor_id
)
ORDER BY id, YEAR, month;

    
SELECT * FROM "USER";

SELECT * FROM TASK ORDER BY TASK.EXECUTOR_ID, completion_date;

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
DELETE FROM Task
WHERE completion_date < DATE '2024-04-01';
    
    INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-08-10', DATE '2024-08-20', 'Completed', 'Feature', 5, 1, 1, DATE '2024-08-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-11-10', DATE '2024-11-20', 'Completed', 'Feature', 5, 1, 1, DATE '2024-11-20');


INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-02-10', DATE '2025-02-20', 'Completed', 'Feature', 5, 1, 2, DATE '2025-02-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-03-10', DATE '2025-03-20', 'Completed', 'Feature', 5, 1, 2, DATE '2025-03-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-10-10', DATE '2024-10-20', 'Completed', 'Feature', 5, 1, 2, DATE '2024-10-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-11-10', DATE '2024-11-20', 'Completed', 'Feature', 5, 1, 2, DATE '2024-11-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 2, DATE '2024-12-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-05-10', DATE '2024-05-20', 'Completed', 'Feature', 5, 1, 3, DATE '2024-05-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-06-10', DATE '2024-06-20', 'Completed', 'Feature', 5, 1, 3, DATE '2024-06-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-07-10', DATE '2024-07-20', 'Completed', 'Feature', 5, 1, 3, DATE '2024-07-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-08-10', DATE '2024-08-20', 'Completed', 'Feature', 5, 1, 3, DATE '2024-08-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-10-10', DATE '2024-10-20', 'Completed', 'Feature', 5, 1, 3, DATE '2024-10-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-11-10', DATE '2024-11-20', 'Completed', 'Feature', 5, 1, 3, DATE '2024-11-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 3, DATE '2024-12-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-03-10', DATE '2025-03-20', 'Completed', 'Feature', 5, 1, 4, DATE '2025-03-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-04-10', DATE '2024-04-20', 'Completed', 'Feature', 5, 1, 4, DATE '2024-04-20');


INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-08-10', DATE '2024-08-20', 'Completed', 'Feature', 5, 1, 4, DATE '2024-08-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-09-10', DATE '2024-09-20', 'Completed', 'Feature', 5, 1, 4, DATE '2024-09-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-10-10', DATE '2024-10-20', 'Completed', 'Feature', 5, 1, 4, DATE '2024-10-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-11-10', DATE '2024-11-20', 'Completed', 'Feature', 5, 1, 4, DATE '2024-11-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 4, DATE '2024-12-20');


INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 5, DATE '2024-12-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-01-10', DATE '2025-01-20', 'Completed', 'Feature', 5, 1, 5, DATE '2025-1-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-03-10', DATE '2025-03-20', 'Completed', 'Feature', 5, 1, 5, DATE '2025-3-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-04-10', DATE '2024-04-20', 'Completed', 'Feature', 5, 1, 5, DATE '2024-4-20');


INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-06-10', DATE '2024-06-20', 'Completed', 'Feature', 5, 1, 5, DATE '2024-06-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-07-10', DATE '2024-07-20', 'Completed', 'Feature', 5, 1, 5, DATE '2024-07-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-08-10', DATE '2024-08-20', 'Completed', 'Feature', 5, 1, 5, DATE '2024-08-20');


INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-01-10', DATE '2025-01-20', 'Completed', 'Feature', 5, 1, 6, DATE '2025-01-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-04-10', DATE '2024-04-20', 'Completed', 'Feature', 5, 1, 6, DATE '2024-04-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-05-10', DATE '2024-05-20', 'Completed', 'Feature', 5, 1, 6, DATE '2024-05-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 6, DATE '2024-12-20');


--7
INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-02-10', DATE '2025-02-20', 'Completed', 'Feature', 5, 1, 7, DATE '2025-02-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-03-10', DATE '2025-03-20', 'Completed', 'Feature', 5, 1, 7, DATE '2025-03-20');


INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-04-10', DATE '2024-04-20', 'Completed', 'Feature', 5, 1, 7, DATE '2024-04-20');


INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-07-10', DATE '2024-07-20', 'Completed', 'Feature', 5, 1, 7, DATE '2024-07-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-09-10', DATE '2024-09-20', 'Completed', 'Feature', 5, 1, 7, DATE '2024-09-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-11-10', DATE '2024-11-20', 'Completed', 'Feature', 5, 1, 7, DATE '2024-11-20');

--8
INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-02-10', DATE '2025-02-20', 'Completed', 'Feature', 5, 1, 8, DATE '2025-02-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-03-10', DATE '2025-03-20', 'Completed', 'Feature', 5, 1, 8, DATE '2025-03-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-05-10', DATE '2024-05-20', 'Completed', 'Feature', 5, 1, 8, DATE '2024-05-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-07-10', DATE '2024-07-20', 'Completed', 'Feature', 5, 1, 8, DATE '2024-07-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-08-10', DATE '2024-08-20', 'Completed', 'Feature', 5, 1, 8, DATE '2024-08-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-11-10', DATE '2024-11-20', 'Completed', 'Feature', 5, 1, 8, DATE '2024-11-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 8, DATE '2024-12-20');

--9
INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-02-10', DATE '2025-02-20', 'Completed', 'Feature', 5, 1, 9, DATE '2025-02-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-03-10', DATE '2025-03-20', 'Completed', 'Feature', 5, 1, 9, DATE '2025-03-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-04-10', DATE '2024-04-20', 'Completed', 'Feature', 5, 1, 9, DATE '2024-04-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 9, DATE '2024-12-20');

--10
INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-01-10', DATE '2025-01-20', 'Completed', 'Feature', 5, 1, 10, DATE '2026-01-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2025-02-10', DATE '2025-02-20', 'Completed', 'Feature', 5, 1, 10, DATE '2025-02-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-04-10', DATE '2024-04-20', 'Completed', 'Feature', 5, 1, 10, DATE '2024-04-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-11-10', DATE '2024-11-20', 'Completed', 'Feature', 5, 1, 10, DATE '2024-11-20');

INSERT INTO Task(title, DESCRIPTION, CREATION_DATE, DEADLINE, STATUS, "TYPE", PROJECT_ID, CREATOR_ID, EXECUTOR_ID, COMPLETION_DATE) 
VALUES ('some task', 'description for some task', DATE '2024-12-10', DATE '2024-12-20', 'Completed', 'Feature', 5, 1, 10, DATE '2024-12-20');

    
    
    
    