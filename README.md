# Task API

A simple CRUD API for managing tasks, built with Express and TypeScript. Includes Swagger UI documentation.

![Swagger Screenshot](Swagger%20Screenshot.png)

## Installation & Running

```bash
npm install
npm run dev
```

The server starts on `http://localhost:3000`. Swagger docs available at `http://localhost:3000/docs`.

## Endpoints

| Method | Endpoint         | Description              | Status Codes |
|--------|------------------|--------------------------|--------------|
| GET    | `/`              | API info                 | 200          |
| GET    | `/health`        | Health check             | 200          |
| GET    | `/tasks`         | Get all tasks            | 200          |
| POST   | `/tasks`         | Create a new task        | 201, 400     |
| GET    | `/tasks/:id`     | Get a task by ID         | 200, 404     |
| PUT    | `/tasks/:id`     | Update a task by ID      | 200, 400, 404 |
| DELETE | `/tasks/:id`     | Delete a task by ID      | 204, 404     |

## curl Commands

**GET / - API Info**

```bash
curl http://localhost:3000/
```

**GET /health - Health Check**

```bash
curl http://localhost:3000/health
```

**GET /tasks - Get All Tasks**

```bash
curl http://localhost:3000/tasks
```

**POST /tasks - Create a Task**

```bash
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\": \"Buy milk\"}"
```

**GET /tasks/:id - Get a Task by ID**

```bash
curl http://localhost:3000/tasks/1
```

**PUT /tasks/:id - Update a Task**

```bash
curl -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d "{\"title\": \"Buy almond milk\", \"done\": true}"
```

**DELETE /tasks/:id - Delete a Task**

```bash
curl -X DELETE http://localhost:3000/tasks/1
```
