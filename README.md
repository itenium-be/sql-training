SQL Training
============

Bun: v1.4

## Host the game

One machine (e.g. a minipc on a dedicated router) runs everything; players only need a browser.

From your PC (ssh key access to the minipc, Docker on the minipc):

```sh
./deploy.sh
# Players browse to http://<minipc-ip>/
```

`deploy.sh` copies the current checkout to `~/sql-training` on the minipc, rebuilds and starts everything there, waits until it responds and prints the URLs.
Copy `.env.sample` to `.env`. The minipc IP is read from `MINIPC_IP` in `.env` (default `192.168.1.20`); if ssh fails it asks for a new IP and saves it.
Optional: `MINIPC_USER` (default `wouter`), `MINIPC_DIR`. Secrets (`API_KEY`, `INTERNAL_API_KEY`) are generated in `.env` on the minipc on first deploy.
`./deploy.sh --reset` wipes all data first.

Everything goes through the nginx reverse proxy on port 80 (`HTTP_PORT` to change it):

- `/` the website
- `/api/` back-end (Swagger UI)
- `/leaderboard/` leaderboard
- `/slides/` slides (linked from the game header)

The databases are not exposed outside of Docker.
Players query with a read-only `player` user and every query is killed after 5 seconds.

### Reset

```sh
docker compose down -v
docker compose up -d --build
```

## Slides

[Slidev](https://sli.dev) deck in `slides/`, same look as the website.

```sh
cd slides
bun install
bun run dev     # http://localhost:3030, presenter mode at /presenter
bun run build   # static site in slides/dist
```

The deployed deck is built in Docker and served at `/slides/`.

Set `gameUrl`, `wifiNetwork` and `wifiPassword` at the top of `slides/slides.md` before the event.

## Develop

### Everything in Docker, hot reload

```sh
docker compose -f compose.yaml -f compose.dev.yaml watch
# http://localhost  (slides on http://localhost:3030)
```

`compose watch` syncs changed files into the containers; vite HMR and `bun --watch` pick them up.

File-change events don't cross a Windows/9p mount, so the checkout must live on a native Linux filesystem (a WSL `~/dev/...` clone, **not** `/mnt/c` or a Dropbox folder). On a 9p checkout the stack still runs but nothing reloads.

### Databases only, back-ends on the host

Start the databases with their ports exposed:

```sh
docker compose -f compose.yaml -f compose.dev.yaml up -d postgres sqlserver leaderboard-db
```

Check all reference solutions against the databases: `cd sql-back && bun run verify-solutions` (optionally pass game ids, e.g. `Company`).

Set `PG_HOST="localhost"`, `PG_PORT="5175"`, `SQL_SERVER_HOST="localhost"` and `SQL_SERVER_PORT="5174"` in `sql-back/.env`.
Copy `sql-leaderboard/.env.template` to `sql-leaderboard/.env`.

```sh
cd sql-back
bun run dev

cd ../sql-leaderboard
bun run dev

cd ../sql-front
bun run dev
```

The Vite dev server proxies `/api` and `/leaderboard` to the local back-ends.

### Postgres

Starter exercises "World" & "Teachers".

Exercises "Company": ~2.5M generated rows (`sql-data/postgres-company.sql`, deterministic).
The first start of the container takes about a minute to generate the data.

- Server: localhost
- Port: 5175
- Admin: admin / password
- Player (read-only): player / player


### SQL Server

Exercises "Worldcup".

- Server: localhost
- Port: 5174
- Admin: sa / password123!
- Player (read-only): player / Player123!


## Leaderboard

### Admin

Go to `http://<host>/admin` and log in with the `API_KEY` (kept in localStorage).

Game modes:
- `init`: lobby, players register and show up with their avatar on the intro page
- `running`: submissions are scored
- `end`: submissions closed, all solutions visible

The mode is kept in memory: a leaderboard restart resets it to `running`.

```yaml
GET: http://<host>/leaderboard/game/state
POST: http://<host>/leaderboard/game/admin/mode
x-api-key: secret
{"mode": "running"}
```

Avatars: see [AvatarPrompts.md](AvatarPrompts.md).


## More exercises

Goal scored at the latest minute that won the game.

In the `goals` table, `score0` and `score1` are `NULL`, our intern forgot to write the code to set these fields. They should be the game score at that point including the goal just scored. Write the UPDATE statement.


### Other resources

- [SQL Murder Mystery](https://mystery.knightlab.com/) - Can you find out whodunnit?
- [datalemur.com](https://datalemur.com/) - Ace the SQL & Data Science Interview
- [sql-practice.com](https://www.sql-practice.com/)
- [sqlzoo](https://sqlzoo.net/wiki/SQL_Tutorial) - Learn SQL in stages (Countries & Teacher datasets came from this one!)
