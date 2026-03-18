FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --legacy-peer-deps

COPY . .

RUN npm run build

RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]
