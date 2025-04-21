

ALTER TABLE [Comment]
ADD hierarchy_path HIERARCHYID NULL;

select hierarchy_path.ToString() as Path, 
--	hierarchy_path.GetLevel() as level,
	id, task_id, user_id, 
	date, text from Comment order by hierarchy_path;

update Comment set hierarchy_path = HIERARCHYID::GetRoot() where id = 2;

declare @parant_node HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 2;
update Comment set hierarchy_path = @parant_node.GetDescendant(NULL, NULL) where id = 9;

declare @parant_node HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 9;
update Comment set hierarchy_path = @parant_node.GetDescendant(NULL, NULL) where id = 1;

declare @parant_node HIERARCHYID;
declare @level HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 9;
select @level = hierarchy_path from Comment where id = 1;
update Comment set hierarchy_path = @parant_node.GetDescendant(@level, NULL) where id = 4;

declare @parant_node HIERARCHYID;
declare @level HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 9;
select @level = hierarchy_path from Comment where id = 4;
update Comment set hierarchy_path = @parant_node.GetDescendant(@level, NULL) where id = 10;

declare @parant_node HIERARCHYID;
declare @level HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 9;
select @level = hierarchy_path from Comment where id = 10;
update Comment set hierarchy_path = @parant_node.GetDescendant(@level, NULL) where id = 5;

declare @parant_node HIERARCHYID;
declare @level HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 9;
select @level = hierarchy_path from Comment where id = 5;
update Comment set hierarchy_path = @parant_node.GetDescendant(@level, NULL) where id = 7;

declare @parant_node HIERARCHYID;
declare @level HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 9;
select @level = hierarchy_path from Comment where id = 7;
update Comment set hierarchy_path = @parant_node.GetDescendant(@level, NULL) where id = 3;

declare @parant_node HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 3;
update Comment set hierarchy_path = @parant_node.GetDescendant(NULL, NULL) where id = 8;

declare @parant_node HIERARCHYID;
declare @level HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 2;
select @level = hierarchy_path from Comment where id = 9;
update Comment set hierarchy_path = @parant_node.GetDescendant(@level, NULL) where id = 6;

CREATE OR ALTER PROCEDURE add_child_comment
    @parent_id INT,
    @task_id INT,
    @user_id INT,
    @text NVARCHAR(255)
AS
BEGIN
    DECLARE @parent_path HIERARCHYID;
	DECLARE @max_sibling_path HIERARCHYID;
    DECLARE @new_path HIERARCHYID;

    SELECT @parent_path = hierarchy_path FROM [Comment] WHERE id = @parent_id;
    SELECT TOP 1 @max_sibling_path = hierarchy_path FROM [Comment]
		WHERE hierarchy_path.GetAncestor(1) = (SELECT hierarchy_path FROM [Comment] WHERE id = @parent_id)
		ORDER BY hierarchy_path DESC;

    IF @parent_path IS NULL
		SET @new_path = HIERARCHYID::GetRoot();
    ELSE
    	SET @new_path = @parent_path.GetDescendant(@max_sibling_path, NULL);

    INSERT INTO [Comment] (task_id, user_id, text, hierarchy_path)
    VALUES (@task_id, @user_id, @text, @new_path);
END;

select hierarchy_path.ToString() as Path, 
	hierarchy_path.GetLevel() as level,
	id, task_id, user_id, 
	date, text from Comment order by hierarchy_path;


delete from Comment where id < 11;

EXEC add_child_comment 
    @parent_id = 11, 
    @task_id = 2, 
    @user_id = 3, 
    @text = 'Some comment 21';


CREATE OR ALTER PROCEDURE get_child_comments
    @node_id INT
AS
BEGIN
    DECLARE @node_path HIERARCHYID;

    SELECT @node_path = hierarchy_path FROM [Comment] WHERE id = @node_id;

    IF @node_path IS NULL
    BEGIN
        PRINT 'Узел не найден';
        RETURN;
    END;

    SELECT hierarchy_path.ToString(),
    hierarchy_path.GetLevel() - @node_path.GetLevel() AS hierarchy_level,
    id, task_id, user_id, text
    FROM [Comment]
    WHERE hierarchy_path.IsDescendantOf(@node_path) = 1
    ORDER BY hierarchy_path;
END;

EXEC get_child_comments @node_id = 2;

CREATE OR ALTER PROCEDURE move_child_comments
    @old_parent_id INT,
    @new_parent_id INT
AS
BEGIN
    DECLARE @old_parent_path HIERARCHYID;
    DECLARE @new_parent_path HIERARCHYID;
	DECLARE @new_parant_max_sibling_path HIERARCHYID;
    DECLARE @child_id INT;
    DECLARE @child_path HIERARCHYID;
    DECLARE @new_child_path HIERARCHYID;
	DECLARE @closest_old_parant_id INT
	DECLARE @closest_old_parent_path HIERARCHYID;
	DECLARE @closest_new_parent_max_sibling_path HIERARCHYID;
    
    SELECT @old_parent_path = hierarchy_path FROM [Comment] WHERE id = @old_parent_id;
    SELECT @new_parent_path = hierarchy_path FROM [Comment] WHERE id = @new_parent_id;

    IF @old_parent_path IS NULL OR @new_parent_path IS NULL
    BEGIN
        PRINT 'Ошибка: один из указанных узлов не существует.';
        RETURN;
    END;

    DECLARE comment_cursor CURSOR FOR
        SELECT id, hierarchy_path
        FROM [Comment]
        WHERE hierarchy_path.IsDescendantOf(@old_parent_path) = 1 AND hierarchy_path <> @old_parent_path
        ORDER BY hierarchy_path;

    OPEN comment_cursor;
    FETCH NEXT FROM comment_cursor INTO @child_id, @child_path;

    WHILE @@FETCH_STATUS = 0
    BEGIN
	    IF @child_path.GetLevel() - @old_parent_path.GetLevel() = 1
	    BEGIN
		    SET @closest_old_parant_id = @child_id;
	    	SELECT TOP 1 @new_parant_max_sibling_path = hierarchy_path FROM [Comment]
				WHERE hierarchy_path.GetAncestor(1) = @new_parent_path
				ORDER BY hierarchy_path DESC;
        SET @new_child_path = @new_parent_path.GetDescendant(@new_parant_max_sibling_path, NULL);
	    END
	    ELSE
	    BEGIN
	    	SELECT @closest_old_parent_path = hierarchy_path FROM [Comment] WHERE id = @closest_old_parant_id;
    		SELECT TOP 1 @closest_new_parent_max_sibling_path = hierarchy_path FROM [Comment]
				WHERE hierarchy_path.GetAncestor(1) = @closest_old_parent_path
				ORDER BY hierarchy_path DESC;
    		SET @new_child_path = @closest_old_parent_path.GetDescendant(@closest_new_parent_max_sibling_path, NULL);
	    END
	    
        UPDATE [Comment]
        SET hierarchy_path = @new_child_path
        WHERE id = @child_id;

        FETCH NEXT FROM comment_cursor INTO @child_id, @child_path;
    END;

    CLOSE comment_cursor;
    DEALLOCATE comment_cursor;

END;

EXEC move_child_comments @old_parent_id = 18, @new_parent_id = 15;


EXEC get_child_comments @node_id = 28;


select hierarchy_path.ToString() as Path, 
	hierarchy_path.GetLevel() as level,
	id, task_id, user_id, 
	date, text from Comment order by hierarchy_path;

delete from Comment where id = 19;

EXEC add_child_comment 
    @parent_id = 16, 
    @task_id = 2, 
    @user_id = 3, 
    @text = 'Some comment 312';

EXEC add_child_comment 
    @parent_id = 15, 
    @task_id = 2, 
    @user_id = 3, 
    @text = 'comment 22';

declare @a HIERARCHYID
select @a = hierarchy_path from Comment where id = 19;
declare @b HIERARCHYID
select @b = hierarchy_path from Comment where id = 17;
select @b.IsDescendantOf(@a);

declare @a HIERARCHYID
select @a = hierarchy_path from Comment where id = 6;
select hierarchy_path.ToString(), id, text from Comment where hierarchy_path.IsDescendantOf(@a) = 1;

declare @parant_node HIERARCHYID;
declare @level HIERARCHYID;
select @parant_node = hierarchy_path from Comment where id = 16;
select @level = hierarchy_path from Comment where id = 16;
update Comment set hierarchy_path = @parant_node.GetDescendant(NULL, NULL) where id = 17;

select hierarchy_path.ToString(), id, text from 

declare @parant_node HIERARCHYID
select @parant_node = hierarchy_path.GetAncestor(1) from Comment where id = 19;
select hierarchy_path.ToString(), id, text from Comment where hierarchy_path = @parant_node;

declare @old_parent_path HIERARCHYID
select @old_parent_path = hierarchy_path from Comment where id = 9;
SELECT hierarchy_path.ToString(), id, text
        FROM [Comment]
        WHERE hierarchy_path.IsDescendantOf(@old_parent_path) = 1 AND hierarchy_path <> @old_parent_path
        order by hierarchy_path;

