FROM node:18.19.1-alpine
WORKDIR app
COPY . .
RUN npm install
EXPOSE 4000
CMD ["npm","start"]