# SQL Showdown: A Competitive Query-Writing Workshop

## Abstract

Most SQL workshops bore you with SELECT * FROM tutorial. This one has a leaderboard. Bring your laptop, spin up a Docker container, and join a live competition where every query you write earns points — for being correct, for being short, and for being fast. Two engines (PostgreSQL and SQL Server), three real datasets (a World atlas, a school administration, and the FIFA World Cup), and a room full of developers racing each other to the top of the board. Whether you're a junior who has only ever written `WHERE id = ?` or a senior who dreams in window functions, you will write SQL you didn't know you could write — and you'll see how everyone else solved the same problem when the endgame reveals all submissions.

## Target Audience

Anyone who writes SQL — backend developers, data engineers, full-stack devs, testers who have to query the dev DB, BI/analytics folks. Mixed-experience rooms work *better*, not worse: the leaderboard rewards both correctness (juniors get points fast) and elegance (seniors fight for golf scores). Comfort with basic `SELECT` / `JOIN` is enough to participate.

## Key Takeaways

- Patterns most devs never reach for in day-to-day work: window functions, recursive CTEs, lateral joins, set operations
- The dialect gap that bites in real projects: where PostgreSQL and SQL Server quietly disagree
- How to read an execution plan well enough to know whether your query is actually fast or just *finished*
- A repeatable mental model for attacking unfamiliar schemas — what to query first, what to ignore
- A working SQL playground (Docker Compose, Postgres + SQL Server, three datasets, the leaderboard) you can take home and run for your own team

## Session Format

3-hour hands-on workshop. Each round: short prompt, everyone writes a query, leaderboard scores correctness + brevity + speed, the room sees the top three solutions before moving on. Scales to half-day or full-day with deeper datasets and harder rounds.

## Prerequisites

- Laptop with Docker Desktop installed
- A SQL client of choice (DBeaver, pgAdmin, SSMS, Azure Data Studio, or the in-browser playground)
- Basic familiarity with `SELECT` and `JOIN` — everything beyond that is fair game to learn on the fly
