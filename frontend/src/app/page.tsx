

"use client";

import { useState, useEffect } from "react";

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);


  // const API_URL = "http://localhost:8787/api/tasks";
 const API_URL = "https://api.todo-cloud.workers.dev/api/tasks";


  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("get error");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (response.ok) {
        setInput("");
        fetchTasks(); 
      }
    } catch (err) {
      console.error("add error", err);
    }
  };


  const toggleTask = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("update error", err);
    }
  };


  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("delete error", err);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-semibold text-blue-600 flex justify-center">
       To-Do
        </h1>

        <div className="mb-4 flex gap-2">
          <input
            className="text-black flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button
            onClick={addTask}
            className="rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700 transition-colors"
          >
            +
          </button>
        </div>


        {loading ? (
          <p className="text-center text-gray-500 text-sm">Loading tasks...</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={Boolean(task.completed)} 
                    onChange={() => toggleTask(task.id, Boolean(task.completed))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={`text-sm ${
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.text}
                  </span>
                </label>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}