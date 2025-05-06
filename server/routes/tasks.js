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