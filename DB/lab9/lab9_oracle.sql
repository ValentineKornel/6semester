CREATE OR REPLACE TYPE User_Type AS OBJECT (
    id NUMBER,
    name VARCHAR2(100),
    surname VARCHAR2(100),
    email VARCHAR2(100),
    role VARCHAR2(50),
    salary NUMBER,
);

CREATE OR REPLACE TYPE Task_Type AS OBJECT (
    id NUMBER,
    title VARCHAR2(100),
    description VARCHAR2(255),
    creation_date DATE,
    deadline DATE,
    status VARCHAR2(50),
    type VARCHAR2(50),
    project_id NUMBER,
    creator_id NUMBER,
    executor_id NUMBER,
);


CREATE TABLE User_Obj_Table OF User_Type;
CREATE TABLE Task_Obj_Table OF Task_Type;




--1
CREATE OR REPLACE TYPE User_NT AS TABLE OF User_Type;
CREATE OR REPLACE TYPE Task_NT AS TABLE OF Task_Type;


CREATE OR REPLACE TYPE Task_Extended_Type AS OBJECT (
    task_data Task_Type,
    executors User_NT
);

CREATE OR REPLACE TYPE Task_NT_Extended AS TABLE OF Task_Extended_Type;

CREATE TABLE Task_Only_Table (
    id NUMBER,
    title VARCHAR2(100),
    description VARCHAR2(255),
    creation_date DATE,
    deadline DATE,
    status VARCHAR2(50),
    type VARCHAR2(50),
    project_id NUMBER,
    creator_id NUMBER,
    executor_id NUMBER
)


DECLARE
    k1 Task_NT_Extended := Task_NT_Extended();
    task_rec Task_Extended_Type;
    executors User_NT;

	task_found BOOLEAN := FALSE;
	target_title VARCHAR2(100) := 'Документирование';
	
	task_only_collection Task_NT := Task_NT();
BEGIN
    FOR t IN (SELECT * FROM Task_Obj_Table) LOOP
        SELECT CAST(COLLECT(VALUE(u)) AS User_NT)
        INTO executors
        FROM User_Obj_Table u
        WHERE u.id = t.executor_id;

        task_rec := Task_Extended_Type(
            Task_Type(t.id, t.title, t.description, t.creation_date, t.deadline, t.status, t.type, t.project_id, t.creator_id, t.executor_id),
            executors
        );

        k1.EXTEND;
        k1(k1.LAST) := task_rec;
    END LOOP;
        
        
    --b.
    FOR i IN 1..k1.COUNT LOOP
        IF k1(i).task_data.title = target_title THEN
            task_found := TRUE;
            EXIT;
        END IF;
    END LOOP;

    IF task_found THEN
        DBMS_OUTPUT.PUT_LINE('Task with title ' || target_title || ' found.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Task wiht title ' || target_title || ' NOT found');
    END IF;
        
    IF k1.EXISTS(5) THEN
        DBMS_OUTPUT.PUT_LINE('Fifth Task exists in collection');
    END IF;


    -- c
    k1.EXTEND;
    k1(k1.LAST) := Task_Extended_Type(Task_Type('Empty Executors Task', 'Test Desc', SYSDATE + 10, 'Bug', 1, 1, 2), User_NT());
    
    FOR i IN 1..k1.COUNT LOOP
        IF k1(i).executors IS NULL OR k1(i).executors.COUNT = 0 THEN
            DBMS_OUTPUT.PUT_LINE('Задача без исполнителей: ' || k1(i).task_data.title);
        END IF;
    END LOOP;
    
    
    --3
    FOR i IN 1..k1.COUNT LOOP
        task_only_collection.EXTEND;
        task_only_collection(task_only_collection.LAST) := k1(i).task_data;
    END LOOP;
    
    FORALL i IN task_only_collection.FIRST .. task_only_collection.LAST
        INSERT INTO Task_Only_Table (
            id, title, description, creation_date, deadline, status, type, project_id, creator_id, executor_id
        ) VALUES (
            task_only_collection(i).id,
            task_only_collection(i).title,
            task_only_collection(i).description,
            task_only_collection(i).creation_date,
            task_only_collection(i).deadline,
            task_only_collection(i).status,
            task_only_collection(i).type,
            task_only_collection(i).project_id,
            task_only_collection(i).creator_id,
            task_only_collection(i).executor_id
        );
END;


SELECT * FROM Task_Only_Table;



DECLARE
    TYPE TitleList IS TABLE OF Task_Obj_Table.title%TYPE;
    titles TitleList;
BEGIN
    SELECT title BULK COLLECT INTO titles
    FROM Task_Obj_Table
    WHERE status = 'New';

    FOR i IN 1..titles.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('New Task: ' || titles(i));
    END LOOP;
END;



























CREATE TABLE Task_Extended_Obj_Table (
    task_data Task_Type,
    executors User_NT
) NESTED TABLE executors STORE AS Nested_Executors_Table;


FORALL i IN k1.FIRST .. k1.LAST
        INSERT INTO Task_Extended_Obj_Table VALUES(k1(i).task_data, k1(i).executors);


SELECT * FROM Task_Extended_Obj_Table t, TABLE(t.executors) e;
SELECT * FROM Task_Extended_Obj_Table t;








