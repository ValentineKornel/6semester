


select * from World_Countries;

-- 6
SELECT DISTINCT SUBSTRING(geom.STAsText(), 1, CHARINDEX(' ', geom.STAsText()) - 1) as GeometryType
FROM world_countries;


-- 7
SELECT DISTINCT geom.STSrid AS SRID
FROM world_countries;

-- 8
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'world_countries'
AND COLUMN_NAME NOT IN ('qgs_fid', 'geom');

-- 9
SELECT geom.STAsText() AS wkt_description
FROM world_countries;


-- 10.1
WITH ValidGeometries AS (
    SELECT qgs_fid, COUNTRY, geom AS geom
    FROM world_countries
)
SELECT 
    A.COUNTRY,
    A.qgs_fid,
    B.COUNTRY,
    A.geom.STIntersection(B.geom).STAsText() AS intersection_geom
FROM ValidGeometries A
JOIN ValidGeometries B 
    ON A.qgs_fid <> B.qgs_fid
    AND A.geom.STIntersects(B.geom) = 1
WHERE A.COUNTRY = 'BELARUS';


-- 10.2
DECLARE @geom geometry, @id int = 28;
SET @geom = (SELECT geom FROM world_countries WHERE qgs_fid = @id);

WITH Vertices AS (
    SELECT TOP (@geom.STNumPoints()) 
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM master.dbo.spt_values
)
SELECT 
    @geom.STPointN(n).STAsText() AS Vertice
FROM Vertices;

-- 10.3. Нахождение площади пространственных объектов
SELECT qgs_fid, geom.STArea() AS area
FROM world_countries;


-- 11, 12
DECLARE @point geometry;
SET @point = geometry::STPointFromText('POINT(24 52)', 4326);
SELECT @point.STAsText();
SELECT country FROM world_countries WHERE geom.STIntersects(@point) = 1;


DECLARE @line geometry;
SET @line = geometry::STLineFromText('LINESTRING(24 50, 23 51, 10 75, 30 60)', 4326);
SELECT @line.STAsText();
SELECT country FROM world_countries WHERE geom.STIntersects(@line) = 1;


DECLARE @polygon geometry;
SET @polygon = geometry::STPolyFromText('POLYGON((10 10, 30 10, 30 40, 10 40, 10 10))', 4326);
SELECT @polygon.STAsText();
SELECT country FROM world_countries WHERE geom.STIntersects(@polygon) = 1;


-- 13
CREATE SPATIAL INDEX spatial_index
    ON world_countries (geom)
    USING GEOMETRY_GRID
    WITH (
    BOUNDING_BOX = (-90, -180, 90, 180)
    );

DROP INDEX spatial_index ON world_countries

DECLARE @rect geometry;
SET @rect = geometry::STGeomFromText('POLYGON((10 10, 30 10, 30 40, 10 40, 10 10))', 4326);
SELECT country, geom.STAsText()
FROM world_countries
WHERE geom.STIntersects(@rect) = 1;



--для плана запроса последних запросов
SELECT
    qs.plan_handle,
    q.text AS query_text,
    qp.query_plan
FROM 
    sys.dm_exec_query_stats qs
    CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) q
    CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp
WHERE 
    q.text LIKE '%world_countries%';

-- 14
CREATE OR ALTER PROCEDURE GetPolygonFromPoint @p_width FLOAT,
                                              @p_longitude FLOAT,
                                              @p_polygon INT OUTPUT
AS
BEGIN
    DECLARE @v_point GEOMETRY;
    SET @v_point =
            GEOMETRY::STPointFromText('POINT(' + CAST(@p_width AS VARCHAR(20)) + ' ' + CAST(@p_longitude AS VARCHAR(20)) + ')',
                                      4326);

    SELECT TOP 1 @p_polygon = qgs_fid
    FROM world_countries
    WHERE @v_point.STWithin(geom) = 1;
END;

BEGIN
    DECLARE @v_polygon INT;
    EXEC GetPolygonFromPoint 24, 52, @v_polygon OUTPUT;
    SELECT COUNTRY, geom.STAsText() FROM world_countries where qgs_fid = @v_polygon;
END


DECLARE @polygon geometry;
SELECT @polygon = geom FROM world_countries_copy WHERE qgs_fid = 28;
EXEC GetPointsAndMaxZFromPolygon @polygon;



DECLARE @polygon geometry;
SET @polygon = geometry::STPolyFromText('POLYGON((10 10 10, 30 10 11, 30 40 17, 10 40 13, 10 10 14))', 4326);
--SELECT @polygon.STPointN(2).Z;

EXEC GetPointsAndMaxZFromPolygon @polygon;

CREATE OR ALTER PROCEDURE GetPointsAndMaxZFromPolygon
    @polygon geometry
AS
BEGIN
    DECLARE @numPoints INT;
    DECLARE @i INT = 1;
	DECLARE @maxZ FLOAT;
    
    SET @numPoints = @polygon.STNumPoints();
    
    CREATE TABLE #Points (
        PointIndex INT,
        X FLOAT,
        Y FLOAT,
        Z FLOAT
    );
    
    WHILE @i <= @numPoints
    BEGIN
        DECLARE @currentPoint geometry = @polygon.STPointN(@i);
        
        DECLARE @x FLOAT = @currentPoint.STX;
        DECLARE @y FLOAT = @currentPoint.STY;
        DECLARE @z FLOAT = @currentPoint.Z;
        
        INSERT INTO #Points (PointIndex, X, Y, Z)
        VALUES (@i, @x, @y, @z);
        
        SET @i = @i + 1;
    END
    
    SELECT * FROM #Points;
    SELECT @maxZ =  MAX(Z) FROM #Points;
    SELECT X, Y, Z FROM #Points WHERE Z = @maxZ;
    
    DROP TABLE #Points;
END;


