
# 🧠 Full-Stack Task Manager App (React + Vite + MUI + Firebase Auth + Node.js + MongoDB)

## 🗂️ Overview

Build a task manager app using:

- **Frontend**: React + Vite + Material UI  
- **Backend**: Node.js + Express + MongoDB (Mongoose)  
- **Auth**: Firebase Authentication (Email/Password)  

Users can:
- Sign up / Log in
- Add / Edit / Delete tasks
- Tasks are private to each user

---

## 🛠️ Install MongoDB (Windows & macOS)

### For Windows

1. Download MongoDB Community Server from [MongoDB Downloads](https://www.mongodb.com/try/download/community).
2. Run the installer and **select Complete** setup.
3. Make sure the installer **adds MongoDB to your system PATH**.
4. Open Command Prompt and run:
   ```bash
   mongod
   ```
   to start the MongoDB server.

### For macOS

Using Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb/brew/mongodb-community
```

Check it's running:

```bash
mongo
```

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)  
2. Click **"Add project"** and follow the prompts  
3. Under **Build > Authentication**, go to the **Sign-in method** tab  
4. Enable **Email/Password**  
5. Go to **Project Settings > General**  
   - Under **Your apps**, click **Add app** → **Web**  
   - Copy the config object (for React frontend)  
6. Go to **Project Settings > Service Accounts**  
   - Click **Generate new private key**  
   - This downloads the `serviceAccountKey.json` file  
   - Move it to your `server/` folder

---

## ⚙️ .env Setup

Create a `.env` file inside the `server/` directory:

```
MONGO_URI=mongodb://localhost:27017/taskmanager
```

Make sure MongoDB is running locally or use a hosted MongoDB URI.

---

## 🛠️ Backend (Node.js + Express + MongoDB + Firebase Admin)

### 1. Initialize project

```bash
mkdir server && cd server
npm init -y
npm install express mongoose cors dotenv firebase-admin
```

### 2. Folder structure

```
server/
├── index.js
├── routes/
│   └── tasks.js
├── models/
│   └── Task.js
├── middleware/
│   └── verifyToken.js
├── .env
└── serviceAccountKey.json
```

### 3. Middleware: Verify Firebase ID token

**middleware/verifyToken.js**
```js
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    res.sendStatus(403);
  }
};
```

### 4. Task model

**models/Task.js**
```js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  uid: String,
  title: String,
  completed: Boolean,
});

module.exports = mongoose.model("Task", taskSchema);
```

### 5. Task routes

**routes/tasks.js**
```js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router.get("/", async (req, res) => {
  const tasks = await Task.find({ uid: req.uid });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const newTask = new Task({ ...req.body, uid: req.uid });
  const saved = await newTask.save();
  res.json(saved);
});

router.put("/:id", async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
```

### 6. Entry point

**index.js**
```js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use("/api/tasks", require("./routes/tasks"));

app.listen(5000, () => console.log("Server running on port 5000"));
```

---

## 🎨 Frontend (React + Vite + Material UI + Firebase)

### 1. Create React app with Vite

```bash
npm create vite@latest client --template react
cd client
npm install
npm install @mui/material @emotion/react @emotion/styled firebase axios react-router-dom
```


## 🧑‍💻 Frontend Authentication Setup

Here is how to fully implement Firebase Authentication on the client side:

### 1. Firebase Initialization

**src/firebase.js**
```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

---

### 2. useAuth Hook

**src/hooks/useAuth.js**
```js
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  return user;
};
```

---

### 3. Register Page

**src/pages/Register.jsx**
```js
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Registration Error:", error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button onClick={register}>Sign Up</button>
    </div>
  );
}
```

---

### 4. Login Page

**src/pages/Login.jsx**
```js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Error:", error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button onClick={login}>Sign In</button>
    </div>
  );
}
```

---
### 5. Task Manager 
***src/pages***
```
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
```
### 5. Route Protection

Use the `useAuth` hook to conditionally render authenticated routes.

**src/App.jsx**
```js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskManager from "./pages/TaskManager";
import { useAuth } from "./hooks/useAuth";

function App() {
  const user = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={user ? <TaskManager /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

Now your frontend is fully wired to Firebase for auth and protected routing.

## 🚀 Run the App

- Start MongoDB (if not running automatically):

**Windows:**
```bash
mongod
```

**macOS (if installed via Homebrew):**
```bash
brew services start mongodb/brew/mongodb-community
```

- Start backend:
```bash
cd server
node index.js
```

- Start frontend:
```bash
cd client
npm run dev
```

---

## ✅ Conclusion

You’ve built a secure full-stack app with:
- Firebase Authentication (client-managed, server-verified)
- React + Material UI frontend
- Node.js + Express backend
- MongoDB as your database


---

## 🧭 MongoDB Compass (Official GUI)

MongoDB Compass is the official graphical interface for managing and exploring MongoDB databases.

### 🔽 Install Compass

- Download from: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

Choose the version for your OS (Windows, macOS, Linux).

### 🚀 Connect to Localhost

Once installed:

1. Launch MongoDB Compass
2. In the connection dialog, enter:
   ```
   mongodb://localhost:27017
   ```
3. Click **Connect**

You can now:
- Browse collections (like `tasks`)
- View and edit documents
- Run queries and aggregations
- Monitor performance

This is extremely helpful for debugging your backend and inspecting data in development.

