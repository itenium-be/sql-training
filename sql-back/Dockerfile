FROM oven/bun:1.4-slim

WORKDIR /usr/src/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

EXPOSE 8080

CMD ["bun", "dist/index.js"]
