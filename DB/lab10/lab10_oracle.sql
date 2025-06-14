SELECT * FROM DBA_PDBS;
ALTER SESSION SET CONTAINER=ORCLPDB1;


--1
CREATE TABLESPACE lob_tablespace
DATAFILE 'lob_datafile.dbf' SIZE 100M
AUTOEXTEND ON NEXT 10M
EXTENT MANAGEMENT LOCAL UNIFORM SIZE 1M;

--2
CREATE OR REPLACE DIRECTORY LOB_DOCUMENTS_DIR AS '/opt/oracle/oradata/ORCLCDB/ORCLPDB1/lob_files';

--3
CREATE USER lob_user IDENTIFIED BY 12345;

GRANT CONNECT TO lob_user;
GRANT RESOURCE TO lob_user;
GRANT CREATE SESSION TO lob_user;
GRANT EXECUTE ON DBMS_LOB TO lob_user;
GRANT UNLIMITED TABLESPACE TO lob_user;
GRANT READ, WRITE ON DIRECTORY LOB_DOCUMENTS_DIR TO lob_user;

--4
ALTER USER lob_user QUOTA UNLIMITED ON lob_tablespace;

--5
CREATE TABLE BLOB_TABLE
(
    FOTO BLOB DEFAULT EMPTY_BLOB(),
    DOC  BFILE
);

TRUNCATE TABLE BLOB_TABLE;

--6
INSERT INTO BLOB_TABLE (FOTO, DOC)
        VALUES (BFILENAME('LOB_DOCUMENTS_DIR', 'reynira.jpg'), BFILENAME('LOB_DOCUMENTS_DIR', 'doc_file.docx'));

COMMIT;

SELECT * FROM BLOB_TABLE;






