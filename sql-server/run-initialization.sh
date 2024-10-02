# Wait to be sure that SQL Server came up
sleep 90s

/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P password123! -d master -i worldcup.sql
