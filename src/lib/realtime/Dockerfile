FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package.json ./
RUN npm install --production

COPY server.js ./

EXPOSE 4000

CMD ["node", "server.js"]
