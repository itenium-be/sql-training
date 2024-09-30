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

## Restart

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
