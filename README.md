
# 🧠 Full-Stack Task Manager App (React + Vite + MUI + Firebase Auth + Node.js + MySQL)

## 🗂️ Overview

Build a task manager app using:

- **Frontend**: React + Vite + Material UI  
- **Backend**: Node.js + Express + MySQL (via Sequelize)  
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

## 🛠️ Backend (Node.js + Express + MySQL + Sequelize + Firebase Admin)

### 1. Initialize project

```bash
mkdir server && cd server
npm init -y
npm install express sequelize mysql2 cors dotenv firebase-admin
```

### 2. Folder structure

```
server/
├── index.js
├── routes/
│   └── tasks.js
├── models/
│   ├── Task.js
│   └── index.js
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

### 4. Sequelize setup and Task model

**models/index.js**
```js
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Task = require("./Task")(sequelize, Sequelize);

module.exports = db;
```

**models/Task.js**
```js
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: DataTypes.STRING,
    completed: DataTypes.BOOLEAN,
  });
  return Task;
};
```

### 5. Task routes

**routes/tasks.js**
```js
const express = require("express");
const router = express.Router();
const { Task } = require("../models");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router.get("/", async (req, res) => {
  const tasks = await Task.findAll({ where: { uid: req.uid } });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const task = await Task.create({ ...req.body, uid: req.uid });
  res.json(task);
});

router.put("/:id", async (req, res) => {
  const task = await Task.update(req.body, {
    where: { id: req.params.id, uid: req.uid },
  });
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  await Task.destroy({ where: { id: req.params.id, uid: req.uid } });
  res.sendStatus(204);
});

module.exports = router;
```

### 6. Entry point

**index.js**
```js
const express = require("express");
const cors = require("cors");
const db = require("./models");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tasks", require("./routes/tasks"));

db.sequelize.sync().then(() => {
  app.listen(5000, () => console.log("Server running on port 5000"));
});
```

---

## 🎨 Frontend (React + Vite + Material UI + Firebase)

Same as previous: setup Vite app, install Firebase, Axios, React Router, and Material UI.

Update task requests to interact with the new MySQL backend instead of MongoDB.

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
- Firebase Authentication
- MySQL database managed via Sequelize ORM
- Node.js + Express backend
- React + Material UI frontend
