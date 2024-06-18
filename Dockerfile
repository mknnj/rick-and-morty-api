FROM node:12.13.1

EXPOSE 3000
RUN mkdir /app
COPY ./package.json /app
COPY ./package-lock.json /app
WORKDIR /app

RUN npm install

COPY . .

CMD node server.js
