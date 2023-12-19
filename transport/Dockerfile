FROM node:16.17.0
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
