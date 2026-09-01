import express, { Request, Response } from "express";
import swaggerUI from "swagger-ui-express";
import fs from "fs";
import Database from "better-sqlite3";

const app = express();

app.use(express.json());

const db = new Database("tasks.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks
  (id INTEGER PRIMARY KEY,
  title TEXT,
  done INTEGER)`);

const rowCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as {
  count: number;
};

if (rowCount.count === 0) {
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");

  insert.run("write function", 0);
  insert.run("connect project to git", 0);
  insert.run("learn NestJS", 0);

  console.log("Database seeded with 3 example tasks.");
}

const swaggerDocument = JSON.parse(fs.readFileSync("./openapi.json", "utf8"));

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

interface Task {
  id: number;
  title: string;
  done: boolean;
}

app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

interface CreateNewTask {
  title: string;
}

app.post("/tasks", (req: Request<{}, {}, CreateNewTask>, res: Response) => {
  const { title } = req.body;

  if (!title) {
    res.status(400).json({ message: "Missing required field: title" });
    return;
  }
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  const info = insert.run(title, 0);

  res.status(201).json({
    message: "task successfully created",
    data: {
      id: info.lastInsertRowid,
      title: title,
      done: false,
    },
  });
});

interface TaskParams {
  id: string;
}

app.get("/tasks/:id", (req: Request<TaskParams>, res: Response) => {
  const taskId = Number(req.params.id);
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(taskId) as any;

  if (!task) {
    res.status(404).json({ error: `Task ${taskId} not found` });
    return;
  }

  task.done = task.done === 1;

  res.status(200).json(task);
});

interface UpdateTaskBody {
  title?: string;
  done?: boolean;
}

app.put(
  "/tasks/:id",
  (req: Request<TaskParams, {}, UpdateTaskBody>, res: Response) => {
    const tasksId = parseInt(req.params.id);
    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
      res.status(400).json({ error: "Empty or Invalid body" });
      return;
    }

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(tasksId) as any;

    if (!task) {
      res.status(400).json({ error: `Task ${tasksId} not found` });
      return;
    }

    if (title !== undefined) {
      db.prepare("UPDATE tasks SET title = ? WHERE id = ?").run(title, tasksId);
    }
    if (done !== undefined) {
      db.prepare("UPDATE tasks SET done = ? WHERE id = ?").run(
        done ? 1 : 0,
        tasksId,
      );
    }

    const updatedTask = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(tasksId) as any;
    updatedTask.done = updatedTask.done === 1;

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  },
);

app.delete("/tasks/:id", (req: Request<TaskParams>, res: Response) => {
  const tasksId = parseInt(req.params.id);
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(tasksId) as any;

  if (!task) {
    res.status(400).json({ error: `Task ${tasksId} not found` });
    return;
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(tasksId);

  res.status(204).json({ message: "Task deleted successfully" });
});

app.get("/tasks", (req: Request, res: Response) => {
  const { done, search } = req.query;
  const searchTerm = typeof search === "string" ? search.toLowerCase() : "";
  const tasksFromDB = db.prepare("SELECT * FROM tasks").all() as any[];

  const formattedTasks = tasksFromDB.map((task) => ({
    ...task,
    done: task.done === 1,
  }));

  if (done !== undefined || searchTerm !== "") {
    const isDone = done === "true";
    const filteredTask = formattedTasks.filter(
      (task) =>
        (done === undefined || task.done === isDone) &&
        (searchTerm === "" || task.title.toLowerCase().includes(searchTerm)),
    );

    if (filteredTask.length === 0) {
      res.status(200).json({ message: "No task meets this criteria" });
    } else {
      res.status(200).json(filteredTask);
    }

    return;
  }

  res.status(200).json(formattedTasks);
});

app.get("/stats", (req: Request, res: Response) => {
  const totalResult = db
    .prepare("SELECT COUNT(*) as count FROM tasks")
    .get() as { count: number };
  const doneResult = db
    .prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 1")
    .get() as { count: number };

  const total = totalResult.count;
  const doneCount = doneResult.count;
  const openCount = total - doneCount;

  res.status(200).json({ total: total, done: doneCount, open: openCount });
});

app.post("/reset", (req: Request, res: Response) => {
  db.prepare("DELETE FROM tasks").run();

  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  insert.run("write function", 0);
  insert.run("connect project to git", 0);
  insert.run("learn NestJS", 0);

  const tasks = db.prepare("SELECT * FROM tasks").all() as any[];
  const formattedTasks = tasks.map((task) => ({
    ...task,
    done: task.done === 1,
  }));

  res.status(200).json({
    message: "Database reset successfully",
    tasks: formattedTasks,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
