SQL Training
============

Node: v22.1.0

## Prep

Install [Docker for Windows](https://docs.docker.com/desktop/install/windows-install/)

```sh
docker pull postgres:17.0
docker pull node:22.9.0-slim
docker pull mcr.microsoft.com/mssql/server:2019-CU13-ubuntu-20.04
```

## Play

Configure leaderboard URI in `sql-front/config.ts`.

```sh
git clone https://github.com/itenium-be/sql-training
cd sql-training
docker compose up -d --build
# Frontend: http://localhost:5173
# Swagger: http://localhost:8080
```

## Develop

Only start progress & adjust `sql-back/.env`
and set `PG_HOST="localhost"`.

```sh
cd sql-back
npm run dev

cd ../sql-front
npm run dev
```

### Postgres

Starter exercises "World" & "Teachers".

See `compose.yaml` and `sql-back/.env`.  
You can use a tool like [pgAdmin](https://www.postgresql.org/ftp/pgadmin/pgadmin4/v8.12/windows/) to query the data directly.

- Server: localhost
- Port: 5175
- User: admin
- Password: password


### SQL Server

Exercises "Worldcup".

- Server: localhost
- Port: 5174
- User: sa
- Password: password123!


### Restart

The game just executes your SQL. So if you tried a `TRUNCATE table`,
but you want to continue playing after 😃

```sh
docker compose down -v
docker compose up -d --build
```

## Leaderboard

The `sql-front/src/config.ts` contains the leaderboard URI,
of which only one should be running 😀

```sh
cd sql-leaderboard
cp .env.template .env
docker compose up -d
npm run dev
```

### Start Game

```yaml
GET: http://localhost:8000/game/mode?apiKey=secret&mode=running

# Back to init mode:
GET: http://localhost:8000/game/mode?apiKey=secret&mode=init
```

### End Game

Allow people to see all solutions at the endgame:

```
GET: http://localhost:8000/game/mode?apiKey=secret&mode=end
```


## More exercises

Goal scored at the latest minute that won the game.

In the `goals` table, `score0` and `score1` are `NULL`, our intern forgot to write the code to set these fields. They should be the game score at that point including the goal just scored. Write the UPDATE statement.


### Other resources

- [https://mystery.knightlab.com/](SQL Murder Mystery) - Can you find out whodunnit?
- [https://datalemur.com/](datalemur.com) - Ace the SQL & Data Science Interview
- [https://www.sql-practice.com/](sql-practice.com)
- [https://sqlzoo.net/wiki/SQL_Tutorial](sqlzoo) - Learn SQL in stages (Countries & Teacher datasets came from this one!)

