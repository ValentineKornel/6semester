CREATE OR REPLACE TYPE User_Type AS OBJECT (
    id NUMBER,
    name VARCHAR2(100),
    surname VARCHAR2(100),
    email VARCHAR2(100),
    role VARCHAR2(50),
    salary NUMBER,

    CONSTRUCTOR FUNCTION User_Type(
        name VARCHAR2, surname VARCHAR2,
        email VARCHAR2,
        salary NUMBER
    ) RETURN SELF AS RESULT,

    MAP MEMBER FUNCTION get_slary RETURN NUMBER,

    MEMBER FUNCTION get_full_name RETURN VARCHAR2 DETERMINISTIC,

    MEMBER PROCEDURE apply_raise(percentage IN NUMBER)
);



CREATE OR REPLACE TYPE BODY User_Type AS

    CONSTRUCTOR FUNCTION User_Type(
        name VARCHAR2, surname VARCHAR2,
        email VARCHAR2,
        salary NUMBER
    ) RETURN SELF AS RESULT IS
    BEGIN
        SELF.name := name;
        SELF.surname := surname;
        SELF.email := email;
        SELF.role := 'Employee';
        SELF.salary := salary;
        RETURN;
    END;

    MAP MEMBER FUNCTION get_slary RETURN NUMBER IS
    BEGIN
        RETURN salary;
  END;

    MEMBER FUNCTION get_full_name RETURN VARCHAR2 DETERMINISTIC IS
    BEGIN
        RETURN name || ' ' || surname;
    END;

    MEMBER PROCEDURE apply_raise(percentage IN NUMBER) IS
    BEGIN
        salary := salary + salary * percentage / 100;
    END;

END;


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

    CONSTRUCTOR FUNCTION Task_Type(
        title VARCHAR2,
        description VARCHAR2,
        deadline DATE,
        type VARCHAR2,
        project_id NUMBER,
        creator_id NUMBER,
        executor_id NUMBER
    ) RETURN SELF AS RESULT,

    MAP MEMBER FUNCTION get_deadline RETURN DATE,

    MEMBER FUNCTION days_left RETURN NUMBER DETERMINISTIC,

    MEMBER PROCEDURE cancel_task
);


CREATE OR REPLACE TYPE BODY Task_Type AS

    CONSTRUCTOR FUNCTION Task_Type(
        title VARCHAR2,
        description VARCHAR2,
        deadline DATE,
        type VARCHAR2,
        project_id NUMBER,
        creator_id NUMBER,
        executor_id NUMBER
    ) RETURN SELF AS RESULT IS
    BEGIN
        SELF.title := title;
        SELF.description := description;
        SELF.creation_date := SYSDATE;
        SELF.deadline := deadline;
        SELF.status := 'New';
        SELF.type := type;
        SELF.project_id := project_id;
        SELF.creator_id := creator_id;
        SELF.executor_id := executor_id;
        RETURN;
    END;

    MAP MEMBER FUNCTION get_deadline RETURN DATE IS
    BEGIN
        RETURN deadline;
    END;

    MEMBER FUNCTION days_left RETURN NUMBER DETERMINISTIC IS
    BEGIN
        RETURN deadline - SYSDATE;
    END;

    MEMBER PROCEDURE cancel_task IS
    BEGIN
        SELF.status := 'Cancelled';
    END;
END;




DECLARE
    u User_Type;
BEGIN
    u := NEW User_Type('Ivan', 'Ivanov', 'ivan@example.com', 1200);
    DBMS_OUTPUT.PUT_LINE(u.get_full_name || ' ' || u.role);
    u.apply_raise(10);
    DBMS_OUTPUT.PUT_LINE('New salary: ' || u.salary);
END;


DECLARE
    t Task_Type;
BEGIN
    t := NEW Task_Type('Test Task', 'Test Desc', SYSDATE + 10, 'Bug', 1, 1, 2);
    DBMS_OUTPUT.PUT_LINE('Days left: ' || t.days_left);
    t.cancel_task();
    DBMS_OUTPUT.PUT_LINE('Status: ' || t.status);
END;



--3
CREATE TABLE User_Obj_Table OF User_Type;

CREATE TABLE Task_Obj_Table OF Task_Type;

DROP TABLE User_Obj_Table;
DROP TABLE Task_Obj_Table;

INSERT INTO User_Obj_Table
SELECT User_Type(id, name, surname, email, role, salary)
FROM "USER";

INSERT INTO Task_Obj_Table
SELECT Task_Type(
    id,
    title,
    description,
    creation_date,
    deadline,
    status,
    type,
    project_id,
    creator_id,
    executor_id
)
FROM Task;


SELECT * FROM User_Obj_Table;
SELECT * FROM Task_Obj_Table;


--4
CREATE OR REPLACE VIEW User_Obj_View OF User_Type
WITH OBJECT OID (id)
AS
SELECT id, name, surname, email, role, salary
FROM "USER";


SELECT VALUE(u) FROM User_Obj_View u;

SELECT
    u.get_full_name() AS full_name,
    u.salary
FROM User_Obj_View u;


SELECT VALUE(u)
FROM User_Obj_View u
ORDER BY VALUE(u);



CREATE OR REPLACE VIEW Task_Obj_View OF Task_Type
WITH OBJECT OID (id)
AS
SELECT
    id,
    title,
    description,
    creation_date,
    deadline,
    status,
    type,
    project_id,
    creator_id,
    executor_id
FROM Task;



SELECT VALUE(t)
FROM Task_Obj_View t;


SELECT
    t.title,
    t.status,
    t.days_left() AS remaining_days
FROM Task_Obj_View t;


SELECT VALUE(t)
FROM Task_Obj_View t
ORDER BY VALUE(t);


UPDATE Task_Obj_View
SET status = 'Cancelled'
WHERE deadline < SYSDATE;
ROLLBACK;



--5
CREATE INDEX idx_user_email
ON User_Obj_Table (email);

CREATE INDEX idx_user_full_name
ON User_Obj_Table u (u.get_full_name());

SELECT VALUE(u)
FROM User_Obj_Table u
WHERE u.email = 'ivanov@example.com';

SELECT VALUE(u)
FROM User_Obj_Table u
WHERE u.get_full_name() = 'Петр Петров';



CREATE INDEX idx_task_status
ON Task_Obj_Table (status);

CREATE INDEX idx_user_days_left
ON Task_Obj_Table t (t.days_left());

SELECT VALUE(t)
FROM Task_Obj_Table t
WHERE t.status = 'In Progress';

SELECT VALUE(t)
FROM Task_Obj_Table t
WHERE t.days_left() < 3;





