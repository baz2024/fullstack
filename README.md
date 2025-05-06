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

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)  
2. Create a project  
3. Enable **Email/Password** sign-in under **Authentication > Sign-in method**  
4. Register a **Web App** and get the config object  
5. Download the **Service Account Key JSON** under **Project Settings > Service accounts**

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

### 2. Firebase config

**src/firebase.js**
```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. Basic Auth logic

You’ll create:
- Login.jsx
- Register.jsx
- useAuth hook to track the user
- Protect routes via checking auth.currentUser

### 4. Connect with backend

Use Firebase ID token:
```js
const token = await user.getIdToken();
axios.get("/api/tasks", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## 🚀 Run the App

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
- Node.js + Express + MongoDB backend

