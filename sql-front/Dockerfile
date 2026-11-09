FROM node:22.9.0-slim

RUN npm i -g serve

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_THEME
ARG VITE_EVENT_NAME
ARG VITE_EVENT_YEAR
ARG VITE_EVENT_DATE
ARG VITE_EVENT_VENUE
RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]
