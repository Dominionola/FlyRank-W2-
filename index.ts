import express, { Request, Response } from "express";
import swaggerUI from "swagger-ui-express";
import fs from "fs";
import { error } from "node:console";

const app = express();

app.use(express.json());

const swaggerDocument = JSON.parse(fs.readFileSync("./openapi.json", "utf8"));

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const tasks: Task[] = [
  {
    id: 1,
    title: "write function",
    done: false,
  },
  {
    id: 2,
    title: "connect project to git",
    done: false,
  },
  {
    id: 3,
    title: "learn NestJS",
    done: false,
  },
];

app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ name: "Task API", version: "1.0", enpionts: "[/tasks]" });
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

  const newTask: Task = {
    id: tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1,
    title: title,
    done: false,
  };

  tasks.push(newTask);

  res.status(201).json({
    message: "task successfully created",
    data: newTask,
  });
});

interface TaskParams {
  id: string;
}

app.get("/tasks/:id", (req: Request<TaskParams>, res: Response) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    res.status(404).json({ error: `Task ${taskId} not found` });
    return;
  }

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
      res.status(400).json({ error: "Empty or Invalid body " });
      return;
    }

    const taskIndex = tasks.findIndex((t) => t.id === tasksId);

    if (taskIndex === -1) {
      res.status(400).json({ error: `Task ${tasksId} not found` });
    }

    if (title !== undefined) {
      tasks[taskIndex].title = title;
    }
    if (done !== undefined) {
      tasks[taskIndex].done = done;
    }

    res
      .status(200)
      .json({ message: "Task updated sucessfully", task: tasks[taskIndex] });
  },
);

app.delete("/tasks/:id", (req: Request<TaskParams>, res: Response) => {
  const tasksId = parseInt(req.params.id);
  const taskindex = tasks.findIndex((t) => t.id === tasksId);

  if (taskindex === -1) {
    res.status(400).json({ error: `Task ${tasksId} not found` });
  }

  tasks.splice(taskindex, 1);

  res.status(204).json({ message: "Task deleted sucessfully " });
});

app.get("/tasks", (req: Request, res: Response) => {
  const { done, search } = req.query;
  const searchTerm = typeof search === "string" ? search.toLowerCase() : "";

  if (done !== undefined || searchTerm !== "") {
    const isDone = done === "true";
    const filteredTask = tasks.filter(
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

  res.status(200).json(tasks);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
