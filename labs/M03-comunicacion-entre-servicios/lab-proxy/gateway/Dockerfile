FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
CMD ["node", "--watch", "/app/codigo/server.mjs"]
