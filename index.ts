import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

interface Task {
  id: number;
  title: string;
  done: boolean;
}

app.get("/tasks", (req: Request, res: Response) => {
  const tasks: Task[] = [];
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

app.put("/tasks");

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
