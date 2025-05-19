

CREATE TABLE Reportt (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_data XMLTYPE NOT NULL
);

SELECT *
FROM USER_ERRORS
WHERE NAME = 'GENERATEXMLREPORT';


CREATE OR REPLACE FUNCTION GenerateXmlReport
RETURN XMLTYPE
AS
    v_xml XMLTYPE;
BEGIN
    SELECT XMLELEMENT("Projects",
        XMLAGG(
            XMLELEMENT("Project",
                XMLFOREST(
                    p.title AS "ProjectTitle",
                    p.start_date AS "StartDate",
                    p.deadline AS "Deadline",
                    manager.name || ' ' || manager.surname AS "ManagerName"
                ),
                (
                    SELECT
                        XMLELEMENT("Tasks",
                            XMLAGG(
                                XMLELEMENT("Task",
                                    XMLFOREST(
                                        t.title AS "TaskTitle",
                                        t.description AS "TaskDescription",
                                        t.creation_date AS "CreationDate",
                                        t.deadline AS "Deadline",
                                        t.status AS "Status",
                                        t.type AS "Type",
                                        creator.name || ' ' || creator.surname AS "CreatedBy",
                                        executor.name || ' ' || executor.surname AS "ExecutedBy"
                                    )
                                )
                            )
                        )
                    FROM Task t
                    LEFT JOIN "USER" creator ON t.creator_id = creator.id
                    LEFT JOIN "USER" executor ON t.executor_id = executor.id
                    WHERE t.project_id = p.id
                ),
                (
                    SELECT
                        XMLELEMENT("TaskSummary",
                            XMLFOREST(
                                COUNT(*) AS "Total",
                                SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS "NewTasks",
                                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS "InProgressTasks",
                                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS "CompletedTasks",
                                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS "CancelledTasks"
                            )
                        )
                    FROM Task t
                    WHERE t.project_id = p.id
                ),
                XMLELEMENT("GeneratedAt", TO_CHAR(SYSDATE, 'YYYY-MM-DD"T"HH24:MI:SS'))
            )
        )
    )
    INTO v_xml
    FROM Project p
    JOIN "USER" manager ON p.manager_id = manager.id;

    RETURN v_xml;
END;




CREATE OR REPLACE PROCEDURE SaveXmlReport
AS
    v_xml XMLTYPE;
BEGIN
    v_xml := GenerateXmlReport;

    INSERT INTO Reportt(report_data)
    VALUES (v_xml);
END;


BEGIN
    SaveXmlReport;
END;

SELECT * FROM Reportt;

--4
CREATE INDEX idx_report_data_path ON Reportt(report_data) INDEXTYPE IS XDB.XMLIndex;


SELECT *
FROM Reportt r
WHERE EXISTS (
    SELECT 1
    FROM XMLTABLE('/Projects/Project/Task' PASSING r.report_data COLUMNS status VARCHAR2(50) PATH 'status') t
    WHERE t.status = 'Completed'
);




CREATE OR REPLACE PROCEDURE ExtractXmlData(p_status IN VARCHAR2)
AS
BEGIN
    FOR rec IN (
        SELECT 
            r.id AS report_id,
            x.task_title,
            x.status,
            x.type,
            TO_DATE(x.deadline, 'YYYY-MM-DD') AS deadline
        FROM Reportt r,
            XMLTABLE(
                '/Projects/Project/Tasks/Task'
                PASSING r.report_data
                COLUMNS
                    task_title  VARCHAR2(100) PATH 'TaskTitle',
                    status      VARCHAR2(50)  PATH 'Status',
                    type        VARCHAR2(50)  PATH 'Type',
                    deadline    VARCHAR2(50)  PATH 'Deadline'
            ) x
        WHERE x.status = p_status
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE(
            'ReportID: ' || rec.report_id ||
            ', TaskTitle: ' || rec.task_title ||
            ', Status: ' || rec.status ||
            ', Type: ' || rec.type ||
            ', Deadline: ' || TO_CHAR(rec.deadline, 'YYYY-MM-DD')
        );
    END LOOP;
END;


BEGIN
    ExtractXmlData('New');
END;








