FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npx expo export --platform web \
  && mkdir -p www \
  && mv dist www/mobile \
  && cp serve.json www/serve.json

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "www", "-l", "3000"]
