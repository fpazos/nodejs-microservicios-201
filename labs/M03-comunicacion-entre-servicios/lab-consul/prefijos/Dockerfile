FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY *.mjs ./
EXPOSE 3001
CMD ["node", "server.mjs"]
