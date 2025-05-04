FROM node:lts-alpine
WORKDIR /app
COPY ./app ./
RUN apk update && yarn install
CMD ["yarn", "dev", "--host"]