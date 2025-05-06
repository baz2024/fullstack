const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  uid: String,
  title: String,
  completed: Boolean,
});

module.exports = mongoose.model("Task", taskSchema);