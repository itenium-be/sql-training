SQL Training
============

Node: v22.1.0

## Prep

Install [Docker for Windows](https://docs.docker.com/desktop/install/windows-install/)

```sh
docker pull postgres:17.0
docker pull node:22.9.0-slim
```

## Start

Configure leaderboard URI in `sql-front/config.ts`.

```sh
# To play
docker compose up -d --build

# To develop
# Only start progress & adjust `sql-back/.env`
cd sql-back
npm run dev

cd ../sql-front
npm run dev
```

### Postgres

See `compose.yaml` and `sql-back/.env`.  
You can use a tool like [pgAdmin](https://www.postgresql.org/ftp/pgadmin/pgadmin4/v8.12/windows/) to query the data directly.

- Server: localhost
- Port: 5432
- User: admin
- Password: password


### Restart

The game just executes your SQL. So if you tried a `TRUNCATE table`,
but you want to continue playing after 😃

```sh
docker compose down -v
docker compose up -d
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

### End Game

Allow people to see all solutions at the endgame:

```
GET: http://localhost:8000/game/final?apiKey=secret
```
