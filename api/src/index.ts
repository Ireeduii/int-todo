


import { Hono } from 'hono';
import { cors } from 'hono/cors';


type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors());

app.get('/api/tasks', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM tasks").all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: "Баазаас дата авахад алдаа гарлаа" }, 500);
  }
});

app.post('/api/tasks', async (c) => {
  const { text } = await c.req.json<{ text: string }>();
  
  if (!text) {
    return c.json({ error: "Empty text"}, 400);
  }

  await c.env.DB.prepare("INSERT INTO tasks (text, completed) VALUES (?, 0)")
    .bind(text)
    .run();
    
  return c.json({ message: "Success" }, 200);
});


app.put('/api/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const { completed } = await c.req.json<{ completed: boolean }>();
  
  await c.env.DB.prepare("UPDATE tasks SET completed = ? WHERE id = ?")
    .bind(completed ? 1 : 0, id)
    .run();
    
  return c.json({ message: "Updated" });
});


app.delete('/api/tasks/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
  return c.json({ message: "Deleted" });
});

export default app;