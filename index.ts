import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

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
    id: 1,
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

app.get("/tasks", (req: Request, res: Response) => {
  res.status(200).json({ message: "Sucesfully fetched task", tasks });
});

app.post("/tasks", (req: Request<{}, {}, Task>, res: Response) => {
  const { id, title, done } = req.body;

  if (!id || !title || done === undefined) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  res.status(201).json({
    message: "task successfully created",
    data: { id, title, done },
  });
});

interface TaskParams {
  id: string;
}

app.get("/tasks/:id", (req: Request<TaskParams>, res: Response) => {
  const tasksId = req.params.id;

  res.status(200).json({
    message: `Fecthching task with ${tasksId}`,
  });
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
