

ALTER TABLE "COMMENT"
ADD parant_id NUMBER NULL;


SELECT * FROM "COMMENT";

UPDATE "COMMENT" SET parant_id = 2 WHERE id = 9;
UPDATE "COMMENT" SET parant_id = 9 WHERE id = 1;
UPDATE "COMMENT" SET parant_id = 9 WHERE id = 4;
UPDATE "COMMENT" SET parant_id = 9 WHERE id = 10;
UPDATE "COMMENT" SET parant_id = 9 WHERE id = 5;
UPDATE "COMMENT" SET parant_id = 9 WHERE id = 7;
UPDATE "COMMENT" SET parant_id = 9 WHERE id = 3;
UPDATE "COMMENT" SET parant_id = 3 WHERE id = 8;
UPDATE "COMMENT" SET parant_id = 2 WHERE id = 6;

SELECT LEVEL, id, task_id, user_id, "date", text, parant_id
FROM "COMMENT"
START WITH parant_id IS NULL
CONNECT BY PRIOR id = parant_id;

SELECT LPAD(' ', 3 * LEVEL)||text, id, task_id, user_id, "date", parant_id
FROM "COMMENT"
START WITH parant_id IS NULL
CONNECT BY PRIOR id = parant_id;

SELECT LPAD(' ', 3 * LEVEL)||text, id, task_id, user_id, "date", parant_id
FROM "COMMENT"
START WITH parant_id IS NULL
CONNECT BY PRIOR id = parant_id
ORDER SIBLINGS BY text;

SELECT SYS_CONNECT_BY_PATH(id, '/') AS Path_id, task_id, user_id, text
FROM "COMMENT"
START WITH parant_id IS NULL
CONNECT BY PRIOR id = parant_id;


CREATE OR REPLACE PROCEDURE add_child_comment(
    parant_id IN NUMBER,
    task_id IN NUMBER,
    user_id IN NUMBER,
    "date" IN DATE,
    text IN NVARCHAR2
) AS    
BEGIN
    INSERT INTO "COMMENT" (task_id, user_id, "date", text, parant_id)
    VALUES (task_id, user_id, "date", text, parant_id);
    COMMIT;
END;

BEGIN
add_child_comment(NULL, 4, 5, TO_DATE('2025-03-01', 'YYYY-MM-DD'), 'Comment 00');
END;



SELECT SYS_CONNECT_BY_PATH(id, '/') AS Path_id, LEVEL, task_id, user_id, text
FROM "COMMENT"
START WITH id = 2
CONNECT BY PRIOR id = parant_id;



CREATE OR REPLACE PROCEDURE get_comments_with_level(
	p_parant_id NUMBER
) AS
    CURSOR comments_cursor IS
        SELECT SYS_CONNECT_BY_PATH(id, '/') AS Path_id, 
               LEVEL AS hierarchy_level, 
               task_id, 
               user_id, 
               text
        FROM "COMMENT"
        START WITH id = p_parant_id
        CONNECT BY PRIOR id = parant_id;
BEGIN
    FOR rec IN comments_cursor LOOP
        DBMS_OUTPUT.PUT_LINE('Path: ' || rec.Path_id ||
                             ' | Level: ' || rec.hierarchy_level ||
                             ' | Task ID: ' || rec.task_id ||
                             ' | User ID: ' || rec.user_id ||
                             ' | Text: ' || rec.text);
    END LOOP;
END;

BEGIN
	get_comments_with_level(2);
END;



CREATE OR REPLACE PROCEDURE move_child_comments(
    p_old_parant_id IN NUMBER,
    p_new_parant_id IN NUMBER
) AS
BEGIN
    UPDATE "COMMENT"
    SET parant_id = p_new_parant_id
    WHERE parant_id = p_old_parant_id;

    COMMIT;
END;

SELECT SYS_CONNECT_BY_PATH(id, '/') AS Path_id, LEVEL, task_id, user_id, text
FROM "COMMENT"
START WITH parant_id IS NULL
CONNECT BY PRIOR id = parant_id;

BEGIN
	move_child_comments(14, 11);
END;





