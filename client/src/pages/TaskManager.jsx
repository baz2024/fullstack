import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get("http://localhost:5001/api/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await axios.post("http://localhost:5001/api/tasks", { title, completed: false }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks([...tasks, res.data]);
    setTitle("");
  };

  return (
    <div>
      <h2>My Tasks</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>{task.title} - {task.completed ? "✅" : "❌"}</li>
        ))}
      </ul>
    </div>
  );
}