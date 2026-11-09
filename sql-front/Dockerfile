FROM oven/bun:1.4-slim

RUN bun add -g serve

WORKDIR /usr/src/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]
