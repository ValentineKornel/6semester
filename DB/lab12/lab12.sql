

CREATE TABLE Reportt (
    id INT IDENTITY(1,1) PRIMARY KEY,
    report_data XML NOT NULL
);

CREATE PROCEDURE GenerateXmlReport
    @xmlReport XML OUTPUT
AS
BEGIN
    SELECT @xmlReport =
    (
        SELECT 
            P.title AS ProjectTitle,
            P.start_date,
            P.deadline,
            Manager.name + ' ' + Manager.surname AS ManagerName,
            (
                SELECT 
                    T.title AS TaskTitle,
                    T.description AS TaskDescription,
                    T.creation_date,
                    T.deadline,
                    T.status,
                    T.type,
                    Creator.name + ' ' + Creator.surname AS CreatedBy,
                    Executor.name + ' ' + Executor.surname AS ExecutedBy
                FROM [Task] T
                LEFT JOIN [User] Creator ON T.creator_id = Creator.id
                LEFT JOIN [User] Executor ON T.executor_id = Executor.id
                WHERE T.project_id = P.id
                FOR XML PATH('Task'), TYPE
            ) AS Tasks,
            (
                SELECT 
                    COUNT(*) AS Total,
                    SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS NewTasks,
                    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS InProgressTasks,
                    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS CompletedTasks,
                    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledTasks
                FROM [Task] T
                WHERE T.project_id = P.id
                FOR XML PATH('TaskSummary'), TYPE
            ) AS TaskSummary,
            GETDATE() AS GeneratedAt
        FROM [Project] P
        INNER JOIN [User] Manager ON P.manager_id = Manager.id
        FOR XML PATH('Project'), ROOT('Projects'), TYPE
    );
END;


CREATE PROCEDURE SaveXmlReport
AS
BEGIN
    DECLARE @xml XML;

    EXEC GenerateXmlReport @xmlReport = @xml OUTPUT;

    INSERT INTO Reportt(report_data)
    VALUES (@xml);
END;


EXEC SaveXmlReport;

SELECT * FROM Reportt;


--4
CREATE PRIMARY XML INDEX PXML_ReportData ON Reportt(report_data);


SELECT *
FROM Reportt
WHERE report_data.exist('/Projects/Project/Tasks/Task[status="Completed"]') = 1;

-- execution plan
SELECT qs.plan_handle, q.text AS query_text, qp.query_plan
FROM 
    sys.dm_exec_query_stats qs
    CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) q
    CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp

ORDER BY qs.creation_time DESC;



CREATE PROCEDURE ExtractXmlData
    @taskStatus NVARCHAR(50)
AS
BEGIN
    SELECT 
        R.id AS ReportID,
        Task.value('(TaskTitle/text())[1]', 'NVARCHAR(100)') AS TaskTitle,
        Task.value('(status/text())[1]', 'NVARCHAR(50)') AS Status,
        Task.value('(type/text())[1]', 'NVARCHAR(50)') AS Type,
        Task.value('(deadline/text())[1]', 'DATE') AS Deadline
    FROM Reportt R
    CROSS APPLY R.report_data.nodes('/Projects/Project/Tasks/Task') AS X(Task)
    WHERE 
        Task.value('(status/text())[1]', 'NVARCHAR(50)') = @taskStatus;
END;


EXEC ExtractXmlData @taskStatus = 'New';





