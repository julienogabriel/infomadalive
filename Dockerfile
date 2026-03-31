FROM node:20-slim

WORKDIR /app

COPY bot-telegram/package.json ./
RUN npm install

COPY bot-telegram/ ./

CMD ["node", "bot.js"]
