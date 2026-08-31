# BiblioTech Backend

Backend for a library management system for books and loans.

# Installing

## Docker

- Build docker image

    ```shell
    docker build -t biblitech-backend --no-cache .
    ```

- Run docker container

    ```shell
    docker run -d --restart always -p 3000:3000 --name biblitech-backend biblitech-backend
    ```

## Node

- Build project

    ```shell
    npm run build
    ```

- Run project

    ```shell
    npm run start:prod
    ```
  