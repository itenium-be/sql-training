USE [master];
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'player')
  CREATE LOGIN player WITH PASSWORD = 'Player123!', DEFAULT_DATABASE = [sportdb], CHECK_POLICY = OFF;
GO

USE [sportdb];
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'player')
BEGIN
  CREATE USER player FOR LOGIN player;
  ALTER ROLE db_datareader ADD MEMBER player;
END
GO
