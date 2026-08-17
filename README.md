SQL Training
============

Node: v22.1.0

Everybody plays against **one shared server**. Nobody has to run docker on their
own laptop unless they want to.

> **This repository is private, and needs to stay that way.** It holds the
> exercise answers. Players get the databases and the schema, nothing else:
> the answers never leave `sql-back`, not even into the frontend bundle.

## Host the game

On the one machine that runs the training:

```sh
docker pull postgres:17.0
docker pull node:22.9.0-slim
docker pull mcr.microsoft.com/mssql/server:2019-CU13-ubuntu-20.04

git clone https://github.com/itenium-be/sql-training
cd sql-training
cp .env.template .env
# Set PUBLIC_HOST to the hostname or LAN IP the players will browse to.
# It is baked into the frontend at container start, so "localhost" only
# works if you are the only player.
# Also change LEADERBOARD_API_KEY and INTERNAL_API_KEY.

docker compose up -d --build
```

That brings up everything: frontend, query server, leaderboard and all three
databases.

| What | Where |
|---|---|
| Frontend | `http://$PUBLIC_HOST:5173` |
| Swagger | `http://$PUBLIC_HOST:8080` |
| Leaderboard API | `http://$PUBLIC_HOST:4001` |
| Postgres (World, Teachers) | `$PUBLIC_HOST:5175`, admin / password |
| SQL Server (Worldcup) | `$PUBLIC_HOST:5174`, sa / password123! |

Players only need the frontend URL.

### Which server does the frontend talk to?

`sql-front/src/config.ts` resolves the API URLs at runtime, first non empty wins:

1. `window.SQL_TRAINING_CONFIG`, written on container start by
   `sql-front/docker-entrypoint.sh` from the `API_URL` / `LEADERBOARD_URL`
   environment variables. This is what compose sets from `PUBLIC_HOST`.
2. `VITE_API_URL` / `VITE_LEADERBOARD_URL`, for `npm run dev`. See
   `sql-front/.env.development`.
3. The defaults in `config.ts`, which are placeholders you should replace if
   you host this permanently somewhere.

So the same image can be pointed at any server without rebuilding.

## Play along locally (optional)

Running the databases yourself is handy if you like querying with a real tool.
Your exercises still run against the shared server, so nothing you do here is
scored.

```sh
docker compose -f compose.databases.yaml up -d
# Adminer: http://localhost:8081
#   System: PostgreSQL, Server: postgres, User: admin, Password: password, Database: world
```

You can also point [pgAdmin](https://www.postgresql.org/ftp/pgadmin/pgadmin4/v8.12/windows/)
at `localhost:5175` or a SQL Server client at `localhost:5174`.

## Develop

`npm run dev` reads `sql-front/.env.development`, which points at a stack on your
own machine. Create `sql-front/.env.development.local` to point somewhere else.

Start the databases (`docker compose up -d postgres sqlserver leaderboard-db`)
and adjust `sql-back/.env` to set `PG_HOST="localhost"`, `PG_PORT="5175"` and
`SQL_SERVER_HOST="localhost"`, `SQL_SERVER_PORT="5174"`.

`sql-back` submits scores, so it needs the leaderboard running too, with a
matching `INTERNAL_API_KEY` on both sides.

```sh
cd sql-back
npm run dev

cd ../sql-front
npm run dev
```

### Where the exercises live

`sql-back/src/api/exercises/definitions/` — questions, expected results and
hints together. Add or edit exercises there; the frontend picks them up on the
next reload, there is nothing to keep in sync.

The browser only ever gets what a player is allowed to know:

| | Endpoint | Contains |
|---|---|---|
| Catalogue | `GET /exercises` | Question, points, whether a hint exists |
| Submit | `POST /exercises` | Your rows, the query cost, and `correct: true/false` |
| Hint | `POST /exercises/hint` | The hint and the expected result, *and records that you asked* |

The server grades the answer, counts the attempts and reports the score to the
leaderboard itself over `INTERNAL_API_KEY`. That is what makes the first-try and
no-hints bonuses mean anything: none of those numbers pass through the browser,
and `POST /game` on the leaderboard refuses anything without that key.

### Nobody can wreck the shared database

The game used to just execute your SQL, so a stray `TRUNCATE countries` ruined
the exercises for the whole room. On a shared server that is no longer possible:

- Postgres exercises run as the read only `player` role
  (`sql-data/postgres-roles.sql`) inside a `READ ONLY` transaction.
- SQL Server exercises run inside a transaction that is always rolled back.
  SQL Server rolls back DDL too, so even a `DROP TABLE` does not survive.
- Every query gets a statement timeout (`QUERY_TIMEOUT_MS`, 10s) and results are
  capped at `QUERY_MAX_ROWS` rows, so one cartesian join cannot take the server
  down for everyone.

The `player` role is created by a postgres init script, which only runs on an
empty volume. Upgrading an existing install:

```sh
docker compose down -v
docker compose up -d --build
```

Until you do, the backend logs a warning and falls back to the admin role in a
`READ ONLY` transaction.

## Scoring

Solving exercises is worth the most; the bonuses are seasoning on top.
All the weights live in one place: `sql-front/src/leaderboard/scoring.ts`.

| | Worth | How |
|---|---|---|
| **Points** | 1-3 per exercise | Produce the expected result |
| ⚡ **Fastest** | 3 | Quickest of anyone from opening the exercise to solving it |
| 🪶 **Efficient** | 3 | Made the database read the fewest blocks |
| ✂️ **Leanest** | 1 | Shortest SQL, whitespace ignored |
| 🎯 **First Try** | 1 per exercise | Solved on the first Submit |
| 🙈 **No Hints** | 1 per exercise | Solved without asking the server for the hint |

Fastest, Efficient and Leanest are per exercise, best-of-the-room awards. A tie
pays out to everyone tied.

**Efficiency** is read off the query plan, not the clock:
`EXPLAIN (ANALYZE, BUFFERS)` on postgres and `SET STATISTICS IO` on SQL Server.
Those numbers depend on your query, not on how many people are hammering the
server at that moment, so the same query scores the same whether the room is
idle or busy. You see them under the result as `reads` / `cost` /
`rows scanned` while you work.

**Query length** is deliberately the smallest prize on the board. It used to be
worth as much as speed, which quietly taught people that unreadable one liners
win.

## The editor

- Syntax highlighting per dialect: postgres for World and Teachers, T-SQL for
  Worldcup.
- **Format SQL** button, or `Ctrl-Shift-F`, prettifies what you typed.
- `Ctrl-Enter` submits.
- Autocomplete knows the tables and columns of the game you are playing.

## Leaderboard game modes

```yaml
# Let people register and score:
GET: http://$PUBLIC_HOST:4001/game/mode?apiKey=$LEADERBOARD_API_KEY&mode=running

# Back to init mode:
GET: http://$PUBLIC_HOST:4001/game/mode?apiKey=$LEADERBOARD_API_KEY&mode=init

# End the game and let everyone see all solutions:
GET: http://$PUBLIC_HOST:4001/game/mode?apiKey=$LEADERBOARD_API_KEY&mode=end
```

`sql-leaderboard/docker-compose.yml` still runs the leaderboard standalone if
you prefer it separate from the rest.

## More exercises

Goal scored at the latest minute that won the game.

In the `goals` table, `score0` and `score1` are `NULL`, our intern forgot to write the code to set these fields. They should be the game score at that point including the goal just scored. Write the UPDATE statement.

Note that exercises run read only, so a write exercise needs its own endpoint
against a scratch database.

### Other resources

- [SQL Murder Mystery](https://mystery.knightlab.com/) - Can you find out whodunnit?
- [datalemur.com](https://datalemur.com/) - Ace the SQL & Data Science Interview
- [sql-practice.com](https://www.sql-practice.com/)
- [sqlzoo](https://sqlzoo.net/wiki/SQL_Tutorial) - Learn SQL in stages (Countries & Teacher datasets came from this one!)
