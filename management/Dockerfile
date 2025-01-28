FROM node:20.16.0-alpine
LABEL maintainer="IIT-DU"
WORKDIR /app
COPY package*.json .
RUN npm install --production
COPY . .
EXPOSE 8001
CMD ["node", "index.js"]