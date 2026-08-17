FROM node:22.9.0-slim

RUN npm i -g serve

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD [ "./docker-entrypoint.sh" ]
