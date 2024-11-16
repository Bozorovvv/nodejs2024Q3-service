# Home Library Service

## Prerequisites

- Git - Download & Install Git
- Node.js - Download & Install Node.js and the npm package manager
- Docker - Download & Install Docker
- Docker Compose - Download & Install Docker Compose

## Downloading

bash

```
git clone https://github.com/Bozorovvv/nodejs2024Q3-service

cd nodejs2024Q3-service
```

## Installing NPM modules

```
npm install
```

## Docker Setup

### Environment Configuration

Create a .env file in the root directory with the following content:

```
PORT=4000
CRYPT_SALT=10
JWT_SECRET_KEY=secret123123
JWT_SECRET_REFRESH_KEY=secret123123
TOKEN_EXPIRE_TIME=1h
TOKEN_REFRESH_EXPIRE_TIME=24h

POSTGRES_PORT=7777
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nestjs
DATABASE_URL="postgres://postgres:postgres@localhost:5432/nestjs"

DOCKER_POSTGRES_DATA_PATH=H:/docker/postgresql/data
DOCKER_POSTGRES_CONF_PATH=H:/docker/postgresql/conf
```

Create a docker.env file in the root directory with the following content:

```
PORT=4000
CRYPT_SALT=10
JWT_SECRET_KEY=secret123123
JWT_SECRET_REFRESH_KEY=secret123123
TOKEN_EXPIRE_TIME=1h
TOKEN_REFRESH_EXPIRE_TIME=24h

POSTGRES_PORT=7777
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nestjs
DATABASE_URL="postgres://postgres:postgres@postgresdb:5432/nestjs"

DOCKER_POSTGRES_DATA_PATH=H:/docker/postgresql/data
DOCKER_POSTGRES_CONF_PATH=H:/docker/postgresql/conf
```

### Running with Docker

```
# Start the application
npm run docker
```

- This runs the application inside a Docker container and makes it available on localhost:5000.

```
# Stop the application
npm run docker:stop
```

### Running application locally

```
npm start

```

- This runs the application directly on your local machine, making it available on localhost:4000.

#### For development with auto-reload:

```
npm run start:dev

```

### Testing

##### After application running open new terminal and enter:

##### To run all tests without authorization:

```
npm run test
```

##### To run only one of all test suites:

```
npm run test -- <path to suite>
```

### Auto-fix and format

```
# Run linting
npm run lint

# Run formatting
npm run format
```

### Debugging in VSCode

- Press F5 to debug
- For more information, visit: https://code.visualstudio.com/docs/editor/debugging

### Troubleshooting Docker Setup

If you encounter issues with Docker:

```
# View container status
docker compose ps

# Check container logs

docker compose logs

# Restart services

docker compose restart

# Complete reset

docker compose down -v
docker compose up -d
```

### Database Information

- PostgreSQL runs in a Docker container
- Database files are persisted in ./pgdata
- Database configuration stored in ./pgconf
- Access from host machine: localhost:7777
- Access from containers: postgresdb:5432
