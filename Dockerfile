FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Gera o build Web do Expo
RUN npx expo export --platform web

# Instala um servidor HTTP para servir os arquivos estáticos
RUN npm install -g serve

EXPOSE 3000

# Inicia o servidor HTTP
CMD ["serve", "-s", "dist", "-l", "3000"]