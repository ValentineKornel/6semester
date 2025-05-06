SELECT * FROM DBA_PDBS;
ALTER SESSION SET CONTAINER=ORCLPDB1;


SELECT * FROM "USER";
SELECT * FROM TASK;

CREATE OR REPLACE FUNCTION GET_EXECUROTS_AND_TASKS(
    p_StartDate IN DATE,
    p_EndDate IN DATE
)
    RETURN SYS_REFCURSOR
    IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT U.id                      AS USER_ID,
        U.NAME || ' ' || U.SURNAME       AS USER_NAME,
        U.EMAIL                          AS USER_EMAIL,
        T.ID                             AS TASK_ID,
        T.TITLE                          AS TASK_TITLE,
        T.DESCRIPTION                    AS TASK_DESCRIPTION,
        T.CREATION_DATE                  AS TASK_CREATION_DATE,
        T.COMPLETION_DATE                AS TASK_COMPLETION_DATE,
        T.STATUS                         AS TASK_STATUS
        FROM "USER" U
        		INNER JOIN
            TASK T ON U.ID = T.EXECUTOR_ID
        WHERE T.COMPLETION_DATE BETWEEN p_StartDate AND p_EndDate;

    RETURN v_cursor;
END;


CREATE OR REPLACE DIRECTORY IMPORT_DIR AS '/opt/oracle/oradata/ORCLCDB/ORCLPDB1/lab11_oracle';
GRANT READ, WRITE ON DIRECTORY IMPORT_DIR TO KVVCORE;

DECLARE
    result_cursor      SYS_REFCURSOR;
    executor_id          NUMBER;
    executor_name        NVARCHAR2(200);
	executor_email       NVARCHAR2(100);
    task_id              NUMBER;
	task_title           NVARCHAR2(100);
    task_description     NVARCHAR2(255);
    task_creation_date   DATE;
	task_completion_date DATE;
	task_status          NVARCHAR2(50);
    file_handle        UTL_FILE.FILE_TYPE;
BEGIN
    result_cursor := KVVCORE.GET_EXECUROTS_AND_TASKS(DATE '2025-01-01', DATE '2025-03-01');

    file_handle := UTL_FILE.FOPEN('IMPORT_DIR', 'export.txt', 'W');

    LOOP
        FETCH result_cursor INTO executor_id, executor_name, executor_email, task_id, task_title, task_description, task_creation_date, task_completion_date, task_status;
        EXIT WHEN result_cursor%NOTFOUND;

        UTL_FILE.PUT_LINE(file_handle, executor_id || ',' || executor_name || ',' || executor_email || ',' || task_id || ',' || task_title || ',' ||
                          task_description || ',' || task_creation_date || ',' || task_completion_date || ',' || task_status);
    END LOOP;

    CLOSE result_cursor;
    UTL_FILE.FCLOSE(file_handle);
END;


CREATE TABLE USER_TEMP (
    ID INT PRIMARY KEY,
    NAME NVARCHAR2(50) NOT NULL,
    SURNAME NVARCHAR2(50) NOT NULL,
    EMAIL NVARCHAR2(50) NOT NULL,
    ROLE NVARCHAR2(50) NOT NULL,
    SALARY INT
);

cd /opt/oracle/oradata/ORCLCDB/ORCLPDB1/lab11_oracle
sqlldr kvvcore/12345@ORCLPDB1 control=user_loader.ctl log=user_loader.log

SELECT * FROM USER_TEMP;
TRUNCATE TABLE USER_TEMP;




