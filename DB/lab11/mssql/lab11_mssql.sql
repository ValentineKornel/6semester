

CREATE FUNCTION GET_EXECUROTS_AND_TASKS(
    @StartDate DATE,
    @EndDate DATE
)
    RETURNS TABLE
        AS
        RETURN
            (
                SELECT U.id                             AS USER_ID,
                       U.name + ' ' + U.surname         AS USER_NAME,
                       U.email                          AS USER_ROLE,
                       U.salary                         AS USER_SALARY,
                       T.id                             AS TASK_ID,
                       T.title                          AS TASK_TITLE,
                       T.description                    AS TASK_DESCRIPTION,
                       T.creation_date                  AS TASK_CREATION_DATE,
                       T.completion_date                AS TASK_COMPLETION_DATE,
                       T.deadline                       AS TASK_DEADLINE,
                       T.status                         AS TASK_STATUS
                FROM [User] U
                         INNER JOIN
                     Task T ON U.id = T.executor_id
                WHERE T.completion_date BETWEEN @StartDate AND @EndDate
);

select * from [User];
select * from Task ORDER BY completion_date;


SELECT *
FROM GET_EXECUROTS_AND_TASKS('2025-01-01', '2025-03-01');


CREATE TABLE USER_TEMP (
    id INT PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    surname NVARCHAR(50) NOT NULL,
    email NVARCHAR(50) NOT NULL,
    role NVARCHAR(50) NOT NULL,
    salary INT,
);

SELECT * FROM USER_TEMP;
TRUNCATE TABLE USER_TEMP;




