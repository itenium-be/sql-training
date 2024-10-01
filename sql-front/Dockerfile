FROM node:22.9.0-slim

RUN npm i -g serve

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]
