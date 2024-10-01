SQL Training
============

Node: v22.1.0

## Start

```sh
docker compose up -d

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
docker compose up -d
npm run dev
```

### End Game

Allow people to see all solutions at the endgame:

```
GET: http://localhost:8000/game/final?apiKey=secret
```
